import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'login-pgae',
    //   component: () => import('../views/LoginPage.vue'),
    //   meta: {
    //     title: 'Welcome'
    //   }
    // },
    {
      path: '/',
      name: 'main-page',
      component: () => import('../views/MainPage.vue'),
      meta: {
        title: 'Home'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/Auth.vue'),
      meta: {
        title: 'login'
      }
    },
    {
      path: '/viewpridect',
      name: 'viewpridect',
      component: () => import('../views/ViewPredictChart.vue'),
      meta: {
        title: 'viewpridect'
      }
    },
    {
      path: '/selectstock',
      name: 'selectstock',
      component: () => import('../views/StockCard.vue'),
      meta: {
        title: 'selectstock'
      }
    },    
    {
      path: '/selectrating',
      name: 'selectrating',
      component: () => import('../views/StockRating.vue'),
      meta: {
        title: 'selectrating'
      }
    },
    {
      path: '/forecast',
      name: 'forecast',
      component: () => import('../views/ForecastChart.vue'),
      meta: {
        title: 'forecast'
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: {
        title: 'Dashboard'
      }
    },{
      path: '/viewchart',
      name: 'viewchart',
      component: () => import('@/views/ViewChart.vue'),
      meta: {
        title: 'Viewchart'
      }
    }
    ,{
      path: '/viewchart/:initialSymbol',
      name: 'viewchart',
      component: () => import('@/views/ViewChart.vue'),
      meta: {
        title: 'Viewchart'
      }
    }
    ,{
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchStock.vue'),
      meta: {
        title: 'Search'
      }
    },
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta?.title ?? 'Vue App'
  next()
})

export default router
