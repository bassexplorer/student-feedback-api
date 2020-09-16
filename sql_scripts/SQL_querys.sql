-- QUERIES TO THE API 
-- LIST ALL ROLES
SELECT *
FROM feedback_app.user_role;

-- LIST ALL USERS WITH THEIR PASSWORD
SELECT *
FROM feedback_app.user_account
    INNER JOIN feedback_app.user_password
    ON user_account.userID = user_password.FK_userID;


-- SELECT ALL LECTURERS THAT CONNECTED TO THE INSTITUTION ID "2"
-- 2 will be the SQL variable input @instID
SELECT *
FROM feedback_app.user_account
    INNER JOIN feedback_app.inst_user
    ON inst_user.FK_userID = user_account.userID
    INNER JOIN feedback_app.institution
    ON  inst_user.FK_instID = institution.instID
    INNER JOIN feedback_app.user_role
    ON user_account.FK_roleID = user_role.roleID
WHERE inst_user.FK_instID = @instID AND user_role.roleID = 3;


-- SELECT EVERY FEEDBACK CONNECTED TO STUDENT WITH ID "1"
-- 1 will be the SQL variable input @userID

SELECT *
FROM feedback_app.feedback
WHERE feedback.FK_userID_owner = 1;

-- SELECT EVERY FEEDBACK CONNECTED TO LECTURER ID "4" THAT CAN SEE 
-- 4 will be the SQL variable input @userID
SELECT *
FROM feedback_app.feedback
    INNER JOIN feedback_app.feedback_user_allowed
    ON feedback_user_allowed.FK_feedbackID = feedback.feedbackID
WHERE feedback_user_allowed.FK_userID = 4;

-- update the feedback after it is read
-- feedback id will be the variable
UPDATE feedback_app.feedback
SET is_read = 0
WHERE feedback.feedbackID = 1;



-- READ BY EMAIL TO BE ABLE TO TELL IF THE USER IS ALREADY EXISTS IN THE DATABASE 
-- BECAUSE THE EMAIL HAS THE UNIQUE ATTRIBUTE SO JUST 1 ALLOWED IN THE SYSTEM
SELECT userID, user_email
FROM feedback_app.user_account
WHERE user_email = @userEmail;



SELECT fb.*, f2c.*
FROM feedback_app.feedback fb
    INNER JOIN feedback_app.feedback_user_allowed f2c
    ON FK_feedbackID = feedbackID
WHERE fb.feedbackID = 1

SELECT *
FROM feedback_app.feedback


-- LOGIN QUERY TO AUTHENTICATE THE USER

SELECT ua.*, up.*, ur.*, iu.*, inst.*

FROM feedback_app.user_account ua

    INNER JOIN feedback_app.user_password up
    ON ua.userID = up.FK_userID

    INNER JOIN feedback_app.user_role ur
    ON ua.FK_roleID = ur.roleID

    INNER JOIN feedback_app.inst_user iu
    ON  ua.userID = iu.FK_userID

    INNER JOIN feedback_app.institution inst
    ON  iu.FK_instID = inst.instID

WHERE ua.user_email =  @userEmail


 
-- REGISTER QUERY INSERT A NEW USER IN THE DATABASE
DECLARE @inserted TABLE(ID INT)

INSERT INTO feedback_app.user_account
    (user_email, first_name, last_name, FK_roleID)
OUTPUT INSERTED.userID INTO @inserted
VALUES
    (@userEmail, @firstName, @lastName, @roleID)

INSERT INTO feedback_app.user_password
    (FK_userID, hashed_password)
VALUES
    ((SELECT ID
        FROM @inserted), @hashedPassword);

INSERT INTO feedback_app.inst_user
    (FK_userID, FK_instID)
VALUES
    ((SELECT ID
        FROM @inserted), @instID)

SELECT ua.*, ur.*, ia.*, inst.*
FROM feedback_app.user_account ua

    INNER JOIN feedback_app.user_role ur
    ON ua.FK_roleID = ur.roleID

    INNER JOIN feedback_app.inst_user iu
    ON  ua.userID = iu.FK_userID

    INNER JOIN feedback_app.institution inst
    ON  iu.FK_instID = inst.instID

WHERE userID = (SELECT ID
FROM @inserted);