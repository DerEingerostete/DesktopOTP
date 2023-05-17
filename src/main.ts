import {createApp} from 'vue'
import {Dialog, Notify, Quasar} from 'quasar'
import App from './App.vue'
import './samples/node-api'
import "./style.css"

// Import icon libraries
import quasarIconSet from 'quasar/icon-set/fontawesome-v6'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

import {createRouter, createWebHashHistory, Router} from "vue-router";
import LoadingComponent from "./views/LoadingView.vue";
import SetupView from "./views/SetupView.vue";
import LoginView from "./views/LoginView.vue";

const routes = [
    {path: "/", component: LoadingComponent, props: {action: "startup"}},
    {path: "/setup", component: SetupView},
    {path: "/login", component: LoginView},
    {path: "/main", component: LoadingComponent, props: {action: "none", message: "Main Window"}}
];

export const router : Router = createRouter({
    history: createWebHashHistory(),
    routes: routes,
    linkActiveClass: "active"
});

createApp(App)
    .use(router)
    .use(Quasar, {
        plugins: {
            Notify,
            Dialog
        },
        iconSet: quasarIconSet,
        config: {
            notify: {}
        }
    })
    .mount('#app')
    .$nextTick(() => {
        postMessage({payload: 'removeLoading'}, '*')
    }).then();