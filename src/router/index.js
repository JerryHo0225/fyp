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
      path: '/apply',
      name: 'apply-page',
      component: () => import('../views/ApplyForm.vue'),
      meta: {
        title: 'Apply'
      }
    },
    {
      path: '/record',
      name: 'record-page',
      component: () => import('../views/RecordPage.vue'),
      meta: {
        title: 'Record'
      }
    },
    {
      path: '/record/endorsement',
      name: 'endorsement-page',
      component: () => import('../views/RecordPage.vue'),
      meta: {
        title: 'Endorsement'
      }
    },
    {
      path: '/record/approved',
      name: 'approved-page',
      component: () => import('../views/RecordPage.vue'),
      meta: {
        title: 'Approved'
      }
    },
    {
      path: '/record/rejected',
      name: 'rejected-page',
      component: () => import('../views/RecordPage.vue'),
      meta: {
        title: 'Rejected'
      }
    },
    {
      path: '/record/needinfo',
      name: 'needinfo-page',
      component: () => import('../views/RecordPage.vue'),
      meta: {
        title: 'Need Info'
      }
    },
    {
      path: '/record/f1detail/:application_id',
      name: 'f1detail',
      component: () => import('../views/F1FormDetail.vue'),
      meta: {
        title: 'Form F1 Detail'
      }
    },
    {
      path: '/record/f4detail/:application_id',
      name: 'f4detail',
      component: () => import('../views/F4FormDetail.vue'),
      meta: {
        title: 'Form F4 Detail'
      }
    },
    {
      path: '/form/f4',
      name: 'f4form',
      component: () => import('../views/F4FormPage.vue'),
      meta: {
        title: 'Form F4'
      }
    },
    {
      path: '/form/f4/:date',
      name: 'f4form-date',
      component: () => import('../views/F4FormPage.vue'),
      meta: {
        title: 'Form F4'
      }
    },
    {
      path: '/form/f1',
      name: 'f1form',
      component: () => import('../views/F1FormPage.vue'),
      meta: {
        title: 'Form F1'
      }
    },
    {
      path: '/form/f1/:date',
      name: 'f1form-date',
      component: () => import('../views/F1FormPage.vue'),
      meta: {
        title: 'Form F1'
      }
    },
    {
      path: '/login/:token',
      name: 'login-status',
      component: () => import('../views/LoginStatus.vue'),
      meta: {
        title: 'Login'
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
