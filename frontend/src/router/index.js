import { createRouter, createWebHistory } from 'vue-router';

import login from '../components/login.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: login,
        },
    ],
});

export default router;
    