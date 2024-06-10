const request = require('supertest');
const server = require('../server');
const testUtils = require('../test-utils');

const User = require('../models/user');
const Milestone = require('../models/milestone');

describe("/milestones", () => {
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);
    afterEach(testUtils.clearDB);

    const milestone0 = { milestone: "Run 5km", exercise: "Running", timeElapsed: 30, points: 10 };
    const milestone1 = { milestone: "Lift 100kg", exercise: "Weightlifting", timeElapsed: 20, points: 20 };
    const updatedMilestone = { milestone: "Updated Milestone", exercise: "Updated Exercise", timeElapsed: 60 };

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
                const res = await request(server).post("/milestones").send(milestone0);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 with a bad token", async () => {
                const res = await request(server)
                    .post("/milestones")
                    .set("Authorization", "Bearer BAD")
                    .send(milestone0);
                expect(res.statusCode).toEqual(401);
            });
        });
        describe("GET /", () => {
            it("should send 401 without a token", async () => {
                const res = await request(server).get("/milestones").send();
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 with a bad token", async () => {
                const res = await request(server)
                    .get("/milestones")
                    .set("Authorization", "Bearer BAD")
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
        describe("GET /:id", () => {
            it("should send 401 without a token", async () => {
                const res = await request(server).get("/milestones/123").send();
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 with a bad token", async () => {
                const res = await request(server)
                    .get("/milestones/456")
                    .set("Authorization", "Bearer BAD")
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
    });

    describe("After login", () => {
        describe.each([milestone0, milestone1])("POST / milestone %#", (milestone) => {
            it("should allow an admin user to create milestone", async () => {
                const res = await request(server)
                    .post("/milestones")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(milestone);
                expect(res.statusCode).toEqual(200);
                expect(await Milestone.countDocuments()).toEqual(1);
            });
            it("should reject a normal user to create a milestone", async () => {
                const res = await request(server)
                    .post("/milestones")
                    .set("Authorization", `Bearer ${token0}`)
                    .send(milestone);
                expect(res.statusCode).toEqual(403);
                expect(await Milestone.countDocuments()).toEqual(0);
            });
        });

        describe("GET /", () => {
            it("should send 200 and return all created milestones by an admin to the normal user", async () => {
                await request(server)
                    .post("/milestones")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(milestone0);

                const res = await request(server)
                    .get("/milestones")
                    .set("Authorization", `Bearer ${token0}`);
                expect(res.statusCode).toEqual(200);
                expect(res.body.milestones.length).toEqual(1);
            });
            it("should send 200 to admin user and return all milestones", async () => {
                await request(server)
                    .post("/milestones")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(milestone0);

                const res = await request(server)
                    .get("/milestones")
                    .set("Authorization", `Bearer ${adminToken}`);
                expect(res.statusCode).toEqual(200);
                expect(res.body.milestones.length).toEqual(1);
            });
        });

        describe("GET /:id", () => {
            it("should return 404 for invalid milestone ID", async () => {
                const res = await request(server)
                    .get("/milestones/invalidID")
                    .set("Authorization", `Bearer ${token0}`);
                expect(res.statusCode).toEqual(404);
            });

            it("should return 404 for non-existent milestone", async () => {
                const res = await request(server)
                    .get("/milestones/60c72b2f9f1b146b7bcb48a1")
                    .set("Authorization", `Bearer ${token0}`);
                expect(res.statusCode).toEqual(404);
            });
        });

        describe.each([milestone0, milestone1])("PUT / milestone %#", (milestone) => {
            let originalMilestone;
            beforeEach(async () => {
                const res = await request(server)
                    .post('/milestones')
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(milestone);
                originalMilestone = res.body.createdMilestone;
            });

            it("should send 403 to a normal user and not update milestone (only boolean field can be updated by a user)", async () => {
                const res = await request(server)
                    .put(`/milestones/${originalMilestone._id}`)
                    .set("Authorization", `Bearer ${token0}`)
                    .send(updatedMilestone);
                expect(res.statusCode).toEqual(403);
                const notUpdatedMilestone = await Milestone.findById(originalMilestone._id).lean();
                expect(notUpdatedMilestone.milestone).toEqual(milestone.milestone);
                expect(notUpdatedMilestone.timeElapsed).toEqual(milestone.timeElapsed);
            });

            it("should send 200 to admin user and update item", async () => {
                const res = await request(server)
                    .put(`/milestones/${originalMilestone._id}`)
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(updatedMilestone);
                expect(res.statusCode).toEqual(200);
                const updatedItem = await Milestone.findById(originalMilestone._id).lean();
                expect(updatedItem.milestone).toEqual(updatedMilestone.milestone);
                expect(updatedItem.timeElapsed).toEqual(updatedMilestone.timeElapsed);
            });
        });

        describe.each([milestone0, milestone1])("DELETE /:id milestone %#", (milestone) => {
            let originalMilestone;
            beforeEach(async () => {
                const res = await request(server)
                    .post('/milestones')
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(milestone);
                originalMilestone = res.body.createdMilestone;
            });

            it("should send 403 to a normal user and not delete a milestone", async () => {
                const res = await request(server)
                    .delete(`/milestones/${originalMilestone._id}`)
                    .set("Authorization", `Bearer ${token0}`);
                expect(res.statusCode).toEqual(403);
                expect(await Milestone.countDocuments()).toEqual(1);
            });

            it("should send 200 to an admin user and delete the milestone", async () => {
                const res = await request(server)
                    .delete(`/milestones/${originalMilestone._id}`)
                    .set("Authorization", `Bearer ${adminToken}`);
                expect(res.statusCode).toEqual(200);
                expect(await Milestone.countDocuments()).toEqual(0);
            });

            it("should return 403 for unauthorized milestone deletion", async () => {
                const res = await request(server)
                    .delete("/milestones/60c72b2f9f1b146b7bcb48a1")
                    .set("Authorization", `Bearer ${token0}`);
                expect(res.statusCode).toEqual(403);
            });
        });
    });
});
