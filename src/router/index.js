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
      path: '/main/record/rejected',
      name: 'main-page-record-rejected',
      component: () => import('../views/MainPage.vue'),
      meta: {
        title: 'Home'
      }
    },
    {
      path: '/main/record/needinfo',
      name: 'main-page-record-needinfo',
      component: () => import('../views/MainPage.vue'),
      meta: {
        title: 'Home'
      }
    },
    {
      path: '/new',
      name: 'newuser-page',
      component: () => import('../views/NewUser.vue'),
      meta: {
        title: 'New User'
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
      path: '/approving',
      name: 'approving-status',
      component: () => import('../views/Endorsement_and_Approval.vue'),
      meta: {
        title: 'Endorsement and Approval'
      }
    },
    {
      path: '/Endorsement_and_Approval_detail/:application_id',
      name: 'Endorsement_and_Approval_detail-status',
      component: () => import('../views/Endorsement_and_Approval_detail.vue'),
      meta: {
        title: 'Endorsement and Approval Detail'
      }
    },
    {
      path: '/Permissions_assignment',
      name: 'Permissions_assignment-status',
      component: () => import('../views/Permissions_assignment.vue'),
      meta: {
        title: 'Permissions assignment'
      }
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/AdminLogin.vue'),
      meta: {
        title: 'Login'
      }
    },
    {
      path: '/admin/portal',
      name: 'admin-portal',
      component: () => import('../views/AdminPortal.vue'),
      meta: {
        title: 'Admin Portal'
      }
    },
    {
      path: '/admin/portal/total',
      name: 'admin-portal-total',
      component: () => import('../views/AdminPortal.vue'),
      meta: {
        title: 'Admin Portal'
      }
    },
    {
      path: '/admin/portal/unverified',
      name: 'admin-portal-unverified',
      component: () => import('../views/AdminPortal.vue'),
      meta: {
        title: 'Admin Portal'
      }
    },
    {
      path: '/admin/portal/approval',
      name: 'admin-portal-approval',
      component: () => import('../views/AdminPortal.vue'),
      meta: {
        title: 'Admin Portal'
      }
    },
    {
      path: '/admin/portal/reject',
      name: 'admin-portal-reject',
      component: () => import('../views/AdminPortal.vue'),
      meta: {
        title: 'Admin Portal'
      }
    },
    {
      path: '/admin/manage',
      name: 'admin-manage',
      component: () => import('../views/AdminManagement.vue'),
      meta: {
        title: 'Account Management'
      }
    },
    {
      path: '/admin/manage/active',
      name: 'admin-manage-active',
      component: () => import('../views/AdminManagement.vue'),
      meta: {
        title: 'Account Management'
      }
    },
    {
      path: '/admin/manage/disavitve',
      name: 'admin-manage-disavitve',
      component: () => import('../views/AdminManagement.vue'),
      meta: {
        title: 'Account Management'
      }
    },
    {
      path: '/admin/new',
      name: 'admin-new',
      component: () => import('../views/AdminInfoForm.vue'),
      meta: {
        title: 'Create New Admin'
      }
    },
    {
      path: '/admin/edit/:id',
      name: 'admin-edit',
      component: () => import('../views/AdminInfoForm.vue'),
      meta: {
        title: 'Admin Detail'
      }
    },
    {
      path: '/PDF_viwer_',
      name: 'PDF_viwer_',
      component: () => import('../views/pdf_viwer.vue'),
      meta: {
        title: 'PDF_viwer_'
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
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
