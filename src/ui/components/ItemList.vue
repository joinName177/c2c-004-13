<script setup lang="ts">
import { ORIENTATION_LABELS, type OrientationConstraint, type PackingItem } from '../../core/models';
defineProps<{ items: PackingItem[] }>();
const emit = defineEmits<{ remove: [id: string]; toggle: [id: string, mustHave: boolean]; orient: [id: string, orientation: OrientationConstraint] }>();
const orientationOptions = Object.entries(ORIENTATION_LABELS) as Array<[OrientationConstraint, string]>;
</script>

<template>
  <div class="item-list">
    <article v-for="item in items" :key="item.id" class="item-row">
      <div class="item-icon">{{ item.category.slice(0, 1) }}</div>
      <div class="item-copy"><strong>{{ item.name }}</strong><span>{{ item.length }}×{{ item.width }}×{{ item.height }} cm · {{ item.weight }} kg</span></div>
      <select class="orientation-select" :aria-label="`摆放限制 ${item.name}`" :value="item.orientation ?? 'free'" @change="emit('orient', item.id, ($event.target as HTMLSelectElement).value as OrientationConstraint)"><option v-for="[value, label] in orientationOptions" :key="value" :value="value">{{ label }}</option></select>
      <button class="must-button" :class="{ checked: item.mustHave }" type="button" @click="emit('toggle', item.id, !item.mustHave)">{{ item.mustHave ? '必带' : '可选' }}</button>
      <b class="priority">P{{ item.priority }}</b>
      <button class="icon-button" type="button" :aria-label="`删除 ${item.name}`" @click="emit('remove', item.id)">×</button>
    </article>
  </div>
</template>
