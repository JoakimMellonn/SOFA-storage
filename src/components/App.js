import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { UserProvider } from "../contexts/UserContext";
import Signup from "./Signup";
import Main from "./Main";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import ForgotPassword from "./ForgotPassword";
import Navigationbar from "./Navigationbar";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import UpdateProfile from "./UpdateProfile";
import UserOverview from "./UserOverview";
import UserProfile from "./UserProfile";
import AddComponent from "./AddComponent";
import ViewComponent from "./ViewComponent";
import InventoryList from "./InventoryList";
import LatestRequests from "./LatestRequest";

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <Navigationbar />
            <Switch>
              <AdminRoute path="/users" component={UserOverview} />
              <AdminRoute path="/add-component" component={AddComponent} />
              <AdminRoute path="/inventory" component={InventoryList} />
              <AdminRoute path="/latest-requests" component={LatestRequests} />
              <PrivateRoute exact path="/" component={Main} />
              <PrivateRoute path="/update-profile" component={UpdateProfile} />
              <PrivateRoute path="/user-profile" component={UserProfile} />
              <PrivateRoute path="/component/:id" component={ViewComponent} />
              <Route path="/signup" component={Signup} />
              <Route path="/login" component={Login} />
              <Route path="/forgot-password" component={ForgotPassword} />
            </Switch>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
