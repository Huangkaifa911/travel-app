<script setup>
import { defineProps } from 'vue'

defineProps({
  city: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="city-card">
    <div class="city-image-wrapper">
      <img v-lazy="city.image" :alt="city.name" class="city-image" />
      <div class="city-badge" v-if="city.hot">
        <van-tag color="#ee0a24" text-color="#fff">热门</van-tag>
      </div>
    </div>
    <div class="city-info">
      <div class="city-name">{{ city.name }}</div>
      <div class="city-desc">{{ city.desc }}</div>
      <div class="city-tags">
        <van-tag v-for="tag in city.tags" :key="tag" plain type="primary" size="mini">
          {{ tag }}
        </van-tag>
      </div>
      <div class="city-price">
        <span class="price-num">¥{{ city.price }}</span>
        <span class="price-unit">起</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.city-card {
  /* 移除 height: 100px，或者也写上 */
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.city-image-wrapper {
  position: relative;
  height: 100px;
}

.city-image {
  width: 170px;
  height: 100px;
  object-fit: cover;
}

.city-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.city-info {
  padding: 10px;
}

.city-name {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.city-desc {
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.city-tags {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.city-price {
  display: flex;
  align-items: baseline;
}

.price-num {
  color: #ee0a24;
  font-size: 16px;
  font-weight: 600;
}

.price-unit {
  color: #969799;
  font-size: 12px;
  margin-left: 2px;
}
</style>
