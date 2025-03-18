import { createRouter, createWebHistory } from 'vue-router'
import ChoosePrediction from '@/views/ChoosePrediction.vue'
import PredictionResult from '@/views/PredictionResult.vue'
import StockSymbols from '@/views/StockSymbols.vue'

// Recommender System Views
import InitializeRecommender from '@/views/recommender/InitializeRecommender.vue'
import StockRecommendations from '@/views/recommender/StockRecommendations.vue'
import UserPreferences from '@/views/recommender/UserPreferences.vue'
import CompareRecommendations from '@/views/recommender/CompareRecommendations.vue'
import ModelEvaluation from '@/views/recommender/ModelEvaluation.vue'
import UserClusters from '@/views/recommender/UserClusters.vue'
import StockClusters from '@/views/recommender/StockClusters.vue'
import RecommenderUsers from '@/views/recommender/RecommenderUsers.vue'
import RecommenderStocks from '@/views/recommender/RecommenderStocks.vue'
import RecommenderHome from '@/views/recommender/RecommenderHome.vue'
import middleware from '@/views/middleware.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main-page',
      component: () => import('../views/LoginPage.vue'),
      meta: {
        title: 'Home'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginPage.vue'),
      meta: {
        title: 'Login'
      }
    },{
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupPage.vue'),
      meta: {
        title: 'Login'
      }
    },
    {
      path: '/viewpridect',
      name: 'viewpridect',
      component: () => import('../views/ViewPredictChart.vue'),
      meta: {
        title: 'viewpridect'
      },
      props: route => ({
        company: route.query.company,
        time_diff_value: route.query.time_diff_value,
        model_type: route.query.model_type
      })
    }, 
    {
      path: '/hour/viewchart/:initialSymbol',
      name: 'hour_viewchart',
      component: () => import('../views/HourViewChart.vue'),
      meta: {
        title: 'hour_viewchart'
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
    }, {
      path: '/viewchart',
      name: 'viewchart',
      component: () => import('@/views/ViewChart.vue'),
      meta: {
        title: 'Viewchart'
      }
    }
    , {
      path: '/viewchart/:initialSymbol',
      name: 'viewchart',
      component: () => import('@/views/ViewChart.vue'),
      meta: {
        title: 'Viewchart'
      }
    }
    , {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchStock.vue'),
      meta: {
        title: 'Search'
      }
    },
    {
      path: '/choose-prediction',
      name: 'ChoosePrediction',
      component: ChoosePrediction
    },
    {
      path: '/prediction-result',
      name: 'PredictionResult',
      component: PredictionResult
    },
    {
      path: '/stocks/symbols',
      name: 'StockSymbols',
      component: StockSymbols,
      meta: {
        title: 'Stock Symbols'
      }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/AdminUserManagement.vue'),
      meta: { title: 'admin-users' } // Optional: Add middleware to check if user is admin
    },
    // Recommender System Routes
    {
      path: '/recommender',
      name: 'RecommenderHome',
      component: RecommenderHome,
      meta: { requiresAuth: true }
    },
    {
      path: '/recommender/initialize',
      name: 'InitializeRecommender',
      component: InitializeRecommender,
      meta: { requiresAuth: true }
    },
    {
      path: '/recommender/recommendations',
      name: 'StockRecommendations',
      component: StockRecommendations,
      meta: { requiresAuth: true }
    },
    {
      path: '/recommender/user-preferences/:userId?',
      name: 'UserPreferences',
      component: UserPreferences,
      meta: { requiresAuth: true }
    },
    {
      path: '/recommender/user-preferences',
      name: 'UserPreferences',
      component: () => import('../views/recommender/UserPreferences.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/recommender/compare-recommendations/:userId?',
      name: 'CompareRecommendations',
      component: CompareRecommendations,
      meta: { requiresAuth: true }
    },
    {
      path: '/recommender/model-evaluation',
      name: 'ModelEvaluation',
      component: ModelEvaluation,
      meta: { requiresAuth: true }
    },
    {
      path: '/recommender/user-clusters',
      name: 'UserClusters',
      component: UserClusters,
      meta: { requiresAuth: true }
    },
    {
      path: '/recommender/stock-clusters',
      name: 'StockClusters',
      component: StockClusters,
      meta: { requiresAuth: true }
    },
    {
      path: '/recommender/users',
      name: 'RecommenderUsers',
      component: RecommenderUsers,
      meta: { requiresAuth: true }
    },
    {
      path: '/recommender/stocks',
      name: 'RecommenderStocks',
      component: RecommenderStocks,
      meta: { requiresAuth: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        requiresAuth: true // Assuming users need to be authenticated to access this page
      }
    },
    {
      path: '/middleware',
      name: 'middleware',
      component: middleware,
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta?.title ?? 'Vue App'
  next()
})

export default router
