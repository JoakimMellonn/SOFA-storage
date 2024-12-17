# Chomskylab Web-App

---

Chomskylab Web-App created with the intention of supporting users in renting components through Chomskylab, while giving Chomskylab a way to keep track of their inventory and who has rented it. Furthermore, giving the possibility of students to view inventory stock before renting anything.

This application was created with React, using Firebase Auth and Firestore. Images are stored in Firebase Storage. Further dependencies can be viewed in package.json inside the project. The application is a static-webpage, using Firestore for any backend requests.

Search functionality is based through Algolia, note that indexing can take a few seconds so changes might not appear instantanously in the search index!

#### **Note on deleting users:**

Deleting users in the system is not trivial, because of the way the data is structured. (Sub containers in Firestore cannot be deleted automatically)

To delete a user from the system follow these steps:

- Remove any outstanding borrowed components or requests to avoid them sticking around.
- In Firebase Authentication delete the user in question.
- In Firestore find the user in 'users' and delete the collection for the user manually **(DO NOT DELETE ALL USERS IN THE SYSTEM HERE!)**
- Check that there are no Sub-Collections under the user after deleting it. (There shouldn't be...)

_Deleting users in the system should not be needed, please proceed carefully since you can accidently delete all users from the system here..._

---
## BUGS

- ...

## TODO

- Add proper security rules to the firestore database, is somewhat insecure atm. (Good starting point: https://www.youtube.com/watch?v=b7PUm7LmAOw)
