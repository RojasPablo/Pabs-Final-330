# Pabs-Final-330

## FINAL PROJECT

## Back-End Final Project for JS.330

Proposal and Task Breakdown
Your Final Project proposal is due. You should submit a link to a GitHub project that will house your submission. The project README should contain your project proposal. Your proposal should include:

### 1. A description of the scenario your project is operating in.

    - The project is operating as a workout / milestone app. In the app, a user will be able to log in their workout sessions, with input fields that include the name of exercise performed, time elapsed, and the date they conducted their session. In addition, a milestone feature will be implemented as well. These will be fitness achievements set by the admin to help motivate our fitness users and help them explore new heights in their athletic journeys.

### 2. A description of what problem your project seeks to solve.

    - Many fitness apps allow you to log in your own fitness data to view a trend of your journey. However, many of the same apps fail to push their athletes to explore new fitness milestones. As someone who has spent years training, the gym can get stagnent and motivation decreases over time. However, this app can help users find athletic adventures outdoors that could replicate the mundane operations of your gym outings should you feel stuck in your routine.

### 3. A description of what the technical components of your project will be, including: the routes, the data models, any external data sources you'll use, etc.

#### MODELS

    - userSchema ( password, email, roles[String] )
    - workoutSchema ( workoutType, timeElapsed, date )
    - milestoneSchema ( workoutType, timeElapsed )

#### ROUTES

##### WORKOUT ROUTE

    - CREATE/POST / workout => router.post('/')...

    - READ/GET / allWorkouts & workoutById => router.get('/')... => router.get('/:id')...

    - UPDATE/PUT / workout => router.put('/')...

    - DELETE / workoutById => router.delete('/:id')...

##### MILESTONE ROUTE

    - CREATE/POST / monthlyGoal => router.post('/')... // admin only

    - READ/GET / allGoals & goalsById => router.get('/')... => router.get('/:id')... // all

    - UPDATE/PUT / goalById => router.put('/')... // admin only

    - DELETE / goalById => router.delete('/:id')... // all

##### AUTH ROUTE

    - CREATE/POST  / router.post('/signup')

    - CREATE/POST  / router.post('/login')

    - UPDATE/PUT   / router.put('/password')

#### DAO

    - WORKOUT   => createWorkout, getAllWorkouts, getWorkoutById, deleteWorkoutById
    - MILESTONE => createMilestone, getAllMilestones, getMilestoneById
    - AUTH.JS   => createUser, getUser, updatePassword

#### Authentication and Authorization - MIDDLEWARE

    # isAuthorized
    - I will be using JWT to ensure users are verified to have working tokens

    # isAdmin
    - middleware will grant special permissions to 'admin' role
    - if 'user' (can do all CRUD operations on workout logs)
    - if 'admin', Can make monthly goals/milestones for users to see (users can only get/read these monthly goal milestones but cannot post, update, or delete)

#### Indexes for performance and uniqueness when reasonable. At least one of text search, aggregations, and lookups

    - index to get specific types of workouts (ex: search for "stair master" will provide all stairmaster history)

### 4. Clear and direct call-outs of how you will meet the various project requirements.

    -  View PDF in submission to view how project requirements will be met and a timeline of when I expect to complete each task.

![alt text](<Screenshot 2024-05-13 at 1.28.15 PM.png>)
