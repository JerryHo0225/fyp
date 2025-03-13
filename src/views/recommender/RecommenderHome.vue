<template>
      <NavBarView />
  <v-container>
    <recommender-nav></recommender-nav>
    
    
  </v-container>
  <Footer />
</template>

<script setup>
import Footer from '@/components/Footer.vue';
import NavBarView from '@/components/NavBarView.vue';
import RecommenderNav from '@/components/RecommenderNav.vue';

</script>


<script>

export default {
  name: 'RecommenderHome',
  components: {
    RecommenderNav
  }
}
</script>
