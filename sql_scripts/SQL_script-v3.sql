/*
CREATE SCHEMA feedback_app
GO
 */

/* DEVELOPEMENT HELPER SECTCTION*/

ALTER TABLE feedback_app.user_account
DROP CONSTRAINT IF EXISTS FK_user_account_role_ID
GO

ALTER TABLE feedback_app.user_password
DROP CONSTRAINT IF EXISTS FK_user_password_user_account_ID
GO

ALTER TABLE feedback_app.inst_user
DROP CONSTRAINT IF EXISTS FK_inst_user_institution_ID,FK_inst_user_user_account_ID
GO

ALTER TABLE feedback_app.feedback
DROP CONSTRAINT IF EXISTS FK_feedback_user_account_ID_owner
GO

ALTER TABLE feedback_app.feedback_user_allowed
DROP CONSTRAINT IF EXISTS FK_feedback_user_allowed_feedback_ID,FK_feedback_user_allowed_user_account_ID
GO



DROP TABLE IF EXISTS
    feedback_app.user_account
GO

DROP TABLE IF EXISTS
    feedback_app.user_password
GO

DROP TABLE IF EXISTS
    feedback_app.feedback
GO

DROP TABLE IF EXISTS
    feedback_app.feedback_user_allowed
GO

DROP TABLE IF EXISTS
    feedback_app.institution
GO
DROP TABLE IF EXISTS
    feedback_app.inst_user
GO

DROP TABLE IF EXISTS
    feedback_app.user_role
GO


/* CREATE THE ACTUAL DATABASE */
CREATE TABLE feedback_app.user_role
(
    roleID INT IDENTITY (1,1),
    role_name NVARCHAR(50),
    role_desc NVARCHAR(255),

    PRIMARY KEY (roleID),
    UNIQUE (role_name)
);

CREATE TABLE feedback_app.user_account
(
    userID INT IDENTITY (1,1),
    user_email NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(255),
    last_name NVARCHAR(255),
    FK_roleID INT NOT NULL ,

    CONSTRAINT FK_user_account_role_ID FOREIGN KEY (FK_roleID) REFERENCES feedback_app.user_role(roleID),
    PRIMARY KEY (userID),
    UNIQUE (user_email)
);

CREATE TABLE feedback_app.user_password
(
    FK_userID INT NOT NULL,
    hashed_password NVARCHAR(255) NOT NULL,

    UNIQUE (hashed_password),
    CONSTRAINT FK_user_password_user_account_ID FOREIGN KEY (FK_userID) REFERENCES feedback_app.user_account(userID)
);

CREATE TABLE feedback_app.institution
(
    instID INT IDENTITY (1,1),
    short_form NVARCHAR(10),
    full_name NVARCHAR(255) NOT NULL,

    PRIMARY KEY (instID),
    UNIQUE (short_form)
);

CREATE TABLE feedback_app.inst_user
(
    FK_userID INT NOT NULL,
    FK_instID INT NOT NULL,

    CONSTRAINT FK_inst_user_user_account_ID FOREIGN KEY (FK_userID) REFERENCES feedback_app.user_account(userID),
    CONSTRAINT FK_inst_user_institution_ID FOREIGN KEY (FK_instID) REFERENCES feedback_app.institution(instID),
);


CREATE TABLE feedback_app.feedback
(
    feedbackID INT IDENTITY (1,1),
    title NVARCHAR(255),
    content NVARCHAR(MAX),
    is_read BIT DEFAULT 0,
    FK_userID_owner INT NOT NULL ,

    PRIMARY KEY (feedbackID),
    CONSTRAINT FK_feedback_user_account_ID_owner FOREIGN KEY (FK_userID_owner) REFERENCES feedback_app.user_account(userID)

);

CREATE TABLE feedback_app.feedback_user_allowed
(
    FK_userID_lecturer INT NOT NULL ,
    FK_feedbackID INT NOT NULL ,

    CONSTRAINT FK_feedback_user_allowed_user_account_ID FOREIGN KEY (FK_userID_lecturer) REFERENCES feedback_app.user_account(userID),
    CONSTRAINT FK_feedback_user_allowed_feedback_ID FOREIGN KEY (FK_feedbackID) REFERENCES feedback_app.feedback(feedbackID)

);

/* INSERT DEFAULT DEVELOPEMENT CONTENT */

/* BASIC 3 ROLES*/
INSERT INTO feedback_app.user_role
    (role_name,role_desc)
VALUES
    ('admin', 'This may not be implemented functionally'),
    ('student', 'Can create feedback about teachers '),
    ('lecturer', 'Can see feedbacks that students created in the system')


/* COUPLE OF INSTITUTIONS */
INSERT INTO feedback_app.institution
    (short_form, full_name)
VALUES
    ('UCN', 'University Collage Of Northern Denmark'),
    ('AAU', 'Aalborg University')


/* SOME STUDENT*/
INSERT INTO feedback_app.user_account
    (user_email, first_name, last_name, FK_roleID)
VALUES
    ('1081588@ucn.dk', 'Mark Bence', 'Kiss', 1),
    ('1074214@ucn.dk', 'Atanas Valkov', 'Mitev', 1),
    ('student@ucn.dk', 'Jessica', 'Moore', 2),

    /* SOME LECTURERS*/
    ('lecturer@ucn.dk', 'Robert Joseph', 'Mortensen', 3),
    ('lecturer2@ucn.dk', 'Kevin David', 'Kemp', 3),
    ('lecturer3@ucn.dk', 'Gabriel Katelyn ', 'Hansen', 3)


INSERT INTO feedback_app.user_password
    (FK_userID, hashed_password)
VALUES
    (1, '$2a$10$ek1U0B/0TqlXv.8JyiXDnOvsoPTBpBXAEGY2Mkr5lo4gOwc4urS1O'),
    -- pw-kacsa
    (2, '$2a$10$54fLcOSonvoKkBen2t/Ke.R/XpVqUt5XqCfvlAf9NIwGdW.XUAWHu'),
    -- password123
    (3, '$2a$10$09GLDp.w4onUmXThNWiWXe030fDKt2GyO6oamf27mJ9ik75lHDAqC'),
    -- student
    (4, '$2a$10$cXeMmHB5atPDdS1f/6UIkuJDV32y20Gvf9QSTp3AIEYEqaBFat/96')
-- lecturer


INSERT INTO feedback_app.inst_user
    (FK_userID, FK_instID)
VALUES
    (1, 1),
    (2, 1),
    (3, 2),
    (4, 2),
    (5, 1),
    (6, 2)

-- insert some feedback
INSERT INTO feedback_app.feedback
    (title, content, FK_userID_owner)
VALUES
    ('I like the backend classes', 'I enjoy a lot the back-end classes with Rob. He explain very well and make me understand everything :D', 1),
    ('Front-end', 'Front-end is the best thing in the word', 2),
    ('this is a feedback from a student', 'it would be better if i could write something that make sense and not just something placeholder shit...sorry:")', 3),
    ('this is another feedback from a student', 'it would be EVEN better if i could write something that make much more sense than this and not just another placeholder shit...sorry:")', 3)

INSERT INTO feedback_app.feedback_user_allowed
    (FK_userID_lecturer, FK_feedbackID)
VALUES
    (4, 1),
    (5, 2),
    (4, 3),
    (4, 4)