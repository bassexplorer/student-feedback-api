# Student Feedback API Manual
This is a project for the second semester API elective exam project self-chosen topic: Student Feedback App 

|Name| Method| Path| Short Desc|
|--|--|--|--|
 | LOGIN ENDPOINTS | POST | /api/login/student,<br> /api/login/lecturer | To log in the user and get the authentication token 	| 
 
 Admins can login on both enpoint (Even though they don't have any other rights)
 
 #### Expected login payload: 
 ```
 {
  "email": "student@ucn.dk",
  "password": "student"
}
```  

|Name| Method| Path| Short Desc|
|--|--|--|--|
| REGISTRATION ENDPOINT	| POST	| /api/registration	| Register a user in the Database and return <br> the user object without a password	|

#### Expected registration payload:
```
{
 "userEmail": "email@ucn.dk",
 "firstName": "firstname",
 "lastName": "lastname",
 "password": "Password1234",
 "role": {
    "roleId": 1(admin) (not allowed from outside)
              2(student)
              3(lecturer) 
},
 "institution": {
    "instId": 1 (UCN) 
              2(AAU)
    }
}, 
```


|Name| Method| Path| Short Desc| Expected Input 
|--|--|--|--|--|
|FEEDBACK ENDPOINTS <br> (student) |	GET |	/api/feedbacks/student | Get all the feedbacks that a student created | Need `x-authentication-token` as HEADER <br>to be able to authenticate the user|
| FEEDBACK ENDPOINTS <br> (student) |	POST |	/api/feedbacks/student/add | Create a feedback and post it in the database | Need `x-authentication-token` as HEADER to be able to authenticate the user<br> and a payload |

#### Expected feedback payload:
```
{
    "title": "this is the title of the feedback",
    "content": "this is an inserted feedback for lecturer ID 4",
    "lecturerId": 4
}
```

|Name| Method| Path| Short Desc| Expected Input 
|--|--|--|--|--|
|FEEDBACK ENDPOINTS <br> (lecturer)| GET | /api/feedbacks/lecturer | Get all the feedback that a lecturer received from students (with random name)|	Need `x-authentication-token` as HEADER to be able to authenticate the user|
|FEEDBACK ENDPOINTS <br> (lecturer)|	PUT |	/api/feedbacks/lecturer/:feedbackId	| Update a feedback that it is read by the lecturer |	Need `x-authentication-token` as HEADER to be able to authenticate the user <br> The number that goes in place of the feedbackId will be updated to SEEN (is_read = 1) Default value for all feedback is “0”
|FEEDBACK ENDPOINTS <br> (lecturer)|	GET |	/api/feedbacks/lecturer/seen |	Show all the feedback connected to the current logged in user that is not seen yet.(Unread) |	Need `x-authentication-token` as HEADER to be able to authenticate the user|
| FEEDBACK ENDPOINTS <br> (All User) | 	GET	 | /api/feedbacks/all/:lecturerId | This returns all feedbacks connected to a selected lecturer by ID |	Need `x-authentication-token` as HEADER to be able to authenticate the user (reachable for ALL registered user) | 
 | INSTITUTIONS ENDPOINTS | GET |	/api/institutions	 | Returns all institutions from the Database  |  Need `x-authentication-token` as HEADER to be able to authenticate the user (reachable for ALL registered user) | 
 | LECTURER ENDPOINTS	 | GET | 	/api/lecturers/:institutionId	 | Returns all lecturers in the specific institution from the Database	 | Need `x-authentication-token` as HEADER to be able to authenticate the user (reachable for ALL registered user) | 


