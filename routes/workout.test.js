const request = require('supertest');
const server = require('../server');
const testUtils = require('../test-utils');

const User = require('../models/user');
const Workout = require('../models/workout');

describe("/workouts", () => {
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);
    afterEach(testUtils.clearDB);

    const workout0 = { exercise: "Treadmill", timeElapsed: 45, datePerformed: new Date(2024, 3, 20) };
    const workout1 = { exercise: "Bench Press", timeElapsed: 15 };
    const updatedWorkout = { exercise: "Updated Exercise", timeElapsed: 60 };
    
    let token0;
    let adminToken;

    const user0 = {
        username: 'user0',
        email: "user0@mail.com",
        password: "123password"
    };
    const user1 = {
        username: 'user1',
        email: "user1@mail.com",
        password: "456password"
    };

    beforeEach(async () => {
        await request(server).post("/auth/signup").send(user0);
        const res0 = await request(server).post("/auth/login").send(user0);
        token0 = res0.body.token;

        await request(server).post("/auth/signup").send(user1);
        await User.updateOne({ email: user1.email }, { $push: { roles: "admin" } });
        const res1 = await request(server).post("/auth/login").send(user1);
        adminToken = res1.body.token;
    });

    describe("Before login", () => {
        describe("POST /", () => {
            it("should send 401 without a token", async () => {
                const res = await request(server).post("/workouts").send(workout0);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 with a bad token", async () => {
                const res = await request(server)
                    .post("/workouts")
                    .set("Authorization", "Bearer BAD")
                    .send(workout0);
                expect(res.statusCode).toEqual(401);
            });
        });
        describe("GET /", () => {
            it("should send 401 without a token", async () => {
                const res = await request(server).get("/workouts").send();
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 with a bad token", async () => {
                const res = await request(server)
                    .get("/workouts")
                    .set("Authorization", "Bearer BAD")
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
        describe("GET /:id", () => {
            it("should send 401 without a token", async () => {
                const res = await request(server).get("/workouts/123").send();
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 with a bad token", async () => {
                const res = await request(server)
                    .get("/workouts/456")
                    .set("Authorization", "Bearer BAD")
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
    });

    describe("After login", () => {
        describe.each([workout0, workout1])("POST / workout %#", (workout) => {
            it("should allow normal user to create workouts", async () => {
                const res = await request(server)
                    .post("/workouts")
                    .set("Authorization", `Bearer ${token0}`)
                    .send(workout);
                expect(res.statusCode).toEqual(200);
                expect(await Workout.countDocuments()).toEqual(1);
            });
            it("should allow admin to create workouts", async () => {
                const res = await request(server)
                    .post("/workouts")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(workout);
                expect(res.statusCode).toEqual(200);
                expect(await Workout.countDocuments()).toEqual(1);
            });
        });

        describe("GET /", () => {
            it("should return all workout logs for the user", async () => {
                await request(server)
                    .post("/workouts")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(workout0);

                const res = await request(server)
                    .get("/workouts")
                    .set("Authorization", `Bearer ${adminToken}`);
                expect(res.statusCode).toEqual(200);
                expect(res.body.length).toEqual(1);
            });
            it("should not return workout logs of other users", async () => {
                await request(server)
                    .post("/workouts")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(workout0);

                const res = await request(server)
                    .get("/workouts")
                    .set("Authorization", `Bearer ${token0}`);
                expect(res.statusCode).toEqual(200);
                expect(res.body.length).toEqual(0);
            });
        });

        describe("GET /:id", () => {
            it("should return a single workout by id for the user", async () => {
                const createRes = await request(server)
                    .post("/workouts")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(workout0);

                const workoutId = createRes.body._id;

                const res = await request(server)
                    .get(`/workouts/${workoutId}`)
                    .set("Authorization", `Bearer ${adminToken}`);
                expect(res.statusCode).toEqual(200);
                expect(res.body._id).toEqual(workoutId);
            });
            it("should return 404 for non-existent workout id", async () => {
                const res = await request(server)
                    .get("/workouts/60c72b2f9f1b146b7bcb48a1")
                    .set("Authorization", `Bearer ${adminToken}`);
                expect(res.statusCode).toEqual(404);
            });
        });

        describe("DELETE /:id", () => {
            it("should allow a user to delete their workout", async () => {
                const createRes = await request(server)
                    .post("/workouts")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(workout0);

                const workoutId = createRes.body._id;

                const res = await request(server)
                    .delete(`/workouts/${workoutId}`)
                    .set("Authorization", `Bearer ${adminToken}`);
                expect(res.statusCode).toEqual(200);
                expect(await Workout.countDocuments()).toEqual(0);
            });
            it("should return 404 for non-existent workout id", async () => {
                const res = await request(server)
                    .delete("/workouts/60c72b2f9f1b146b7bcb48a1")
                    .set("Authorization", `Bearer ${adminToken}`);
                expect(res.statusCode).toEqual(404);
            });
        });

        describe.each([workout0, workout1])("PUT / workout %#", (workout) => {
            let originalWorkout;
            beforeEach(async () => {
                const res = await request(server)
                    .post('/workouts')
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(workout);
                originalWorkout = res.body;
            });

            it("should update a workout log", async () => {
                const res = await request(server)
                    .put(`/workouts/${originalWorkout._id}`)
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(updatedWorkout);
                expect(res.statusCode).toEqual(200);
                const updatedLog = await Workout.findById(originalWorkout._id).lean();
                expect(updatedLog.exercise).toEqual(updatedWorkout.exercise);
                expect(updatedLog.timeElapsed).toEqual(updatedWorkout.timeElapsed);
            });

            it("should return 404 for non-existent workout id", async () => {
                const res = await request(server)
                    .put("/workouts/60c72b2f9f1b146b7bcb48a1")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(updatedWorkout);
                expect(res.statusCode).toEqual(404);
            });
        });

    });
});
