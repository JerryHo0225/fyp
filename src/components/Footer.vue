<template>
    <v-footer
      class="bg-indigo-lighten-1 text-center d-flex flex-column"
    >
      <div>
        <v-btn
          v-for="icon in icons"
          :key="icon"
          :icon="icon"
          class="mx-4"
          variant="text"
        ></v-btn>
      </div>
  
     
      <v-divider></v-divider>
  
      <div>
        <!-- {{ new Date().getFullYear() }} — <strong>Lovely Henry Dai</strong> -->
        {{ new Date().getFullYear() }}
      </div>
    </v-footer>
  </template>