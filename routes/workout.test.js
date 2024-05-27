const request = require('supertest');

const server = require('../server');
const testUtils = require('../test-utils');

const User = require('../models/user');
const Workout = require('../models/workout');

describe("/workouts", () => {
    
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);
    
    afterEach(testUtils.clearDB);
    
    const workout0 = { exercise: "Treadmill", timeElapsed: 45, datePerformed: new Date(2024, 3, 20) }
    const workout1 = { exercise: "Bench Press", timeElapsed: 15 } // no datePerformed field to test autoDate 


    describe("Before login", () => {
        describe("POST /", () => {
            it("should send 401 without a token", async () => {
                const res = await request(server).post("/workouts").send(workout0);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 with a bad token", async () => {
                const res = await request(server)
                .post("/workouts")
                .set("Authorization", "Beared BAD")
                .send(workout0)
                expect(res.statusCode).toEqual(401);
            });-
        });
        describe("GET /", () => {
            it("shoudl send 401 without a token", async () => {
                const res = await request(server).get("/workouts").send(workout0);
                expect(res.statusCode).toEqual(401);
            })
            it("shoudl send 401 with a bad token", async () => {
                const res = await request(server)
                .get("/workouts")
                .set("Authorization", "Bearer BAD")
                .send()
                expect(res.statusCode).toEqual(401);
            });
        });
        describe("GET /:id", () => {
            it("should send 401 without a token", async () => {
                const res = await request(server).get("/workouts/123").send(workout0);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 with a bad token", async () => {
                const res = await request(server)
                .get("/workouts/456")
                .set("Authorization", "Bearer BAD")
                .send()
                expect(res.statusCode).toEqual(401);
            });
        });
    });
    describe("after login", () => {
        const user0 = {
            email: "user0@mail.com",
            password: "123password"
        };
        const user1 = {
            email: "user1@mail.com",
            password: "456password"
        }
        let token0;
        let adminToken;

        beforeEach(async () => {
            await request(server).post("/auth/signup").send(user0);
            const res0 = await request(server).post("/auth/login").send(user0);
            token0 = res0.body.token;
            await request(server).post("auth/signup").send(user1);
            await User.updateOne(
                { email: user1.email },
                { $push: { roles: "admin" } }
            );
            const res1 = await request(server).post("/auth/login").send(user1);
            adminToken = res1.body.token;
        });
        describe.each([workout0, workout1])("POST / workout %#", (workout) => {
            it("should send 403 to normal user and not store workouts", async () => {
                const res = await request(server)
                .post("/workouts")
                .set("Authorization", "Bearer BAD")
                .send(workout)
                expect(res.statusCode).toEqual(403);
                expect(await Workout.countDocuments()).toEqual(0);
            })
        })

    })
})

"Test conditions"
"POST"
// should reject a workoutLog if exercise and timeElapsed fields are left undefinded 
// a user must be found to save the workout log to their data set
"GET"
// if a user calls getAllWorkouts() it should return all of their logged workouts
// if a user calls the function, it should not return other workout logs from other users (authentication?)
"GET /:id"
// should return a single workout {object} by id for that user
// if admin, it should return a single workout by id for any user //admin only
"DELETE"
// a user should be able to delete a single wokrout from their collection of workout logs

