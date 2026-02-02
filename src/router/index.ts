import { createRouter, createWebHistory } from "vue-router";
import TransmitView from "../views/TransmitView.vue";
import ShareView from "../views/ShareView.vue";
import LoginView from "../views/LoginView.vue";
import axios from "axios";
import NotFound from "../views/NotFound.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/transmit",
    name: "Transmit",
    component: TransmitView,
    beforeEnter: () => {
      axios.get("/api/transmit/logged").then((response) => {
        if (!response.data.isAuthenticated) {
          router.push("/").then(() => {});
        }
      });
    },
  },
  {
    path: "/share/:id",
    name: "Share",
    component: ShareView,
    props: true,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
