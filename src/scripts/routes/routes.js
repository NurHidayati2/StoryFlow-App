// src/scripts/routes/routes.js
import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import MapPage from "../pages/map/map-page";
import AddPage from "../pages/add/add-page";

import HomePresenter from "../presenters/home-presenter.js";
import AboutPresenter from "../presenters/about-presenter.js";
import AddPresenter from "../pages/add/add-presenter.js";

import LoginPage from "../pages/login/login-page.js";
import LoginPresenter from "../pages/login/login-presenter.js";

import ProfilePage from "../pages/profile/profile-page.js";
import ProfilePresenter from "../pages/profile/profile-presenter.js";

import RegisterPage from "../pages/register/register-page.js";
import RegisterPresenter from "../pages/register/register-presenter.js";

import ReportDetailPage from "../report/reportDetail-page.js";


const registerView = new RegisterPage();
const registerPresenter = new RegisterPresenter(registerView);
const profileView = new ProfilePage();
const profilePresenter = new ProfilePresenter(profileView);
const homeView = new HomePage();
const aboutView = new AboutPage();
const mapView = new MapPage();
const addView = new AddPage();
const loginView = new LoginPage();
const reportDetailView = new ReportDetailPage();

const homePresenter = new HomePresenter(homeView);
const aboutPresenter = new AboutPresenter(aboutView);
const addPresenter = new AddPresenter(addView);
const loginPresenter = new LoginPresenter(loginView);

const routes = {
  "/":       { view: homeView,  presenter: homePresenter },
  "/about":  { view: aboutView, presenter: aboutPresenter },
  "/map":    { view: mapView,   presenter: null },
  "/add":    { view: addView,   presenter: addPresenter, requireAuth: true }, // 🔒
  "/login":  { view: loginView, presenter: loginPresenter },
  "/profile":{ view: profileView, presenter: profilePresenter, requireAuth: true },
  "/register": { view: registerView, presenter: registerPresenter },
};

export default routes;
