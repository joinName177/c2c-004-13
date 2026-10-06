<script setup lang="ts">
import type { PackingItem, PackingPlan, Risk, Suitcase } from '../../core/models';
const props = defineProps<{ suitcase: Suitcase; items: PackingItem[]; plan: PackingPlan; risks: Risk[] }>();
const placementOf = (id: string) => props.plan.placements.find((p) => p.itemId === id);
const reasonOf = (id: string) => props.plan.unplaced.find((entry) => entry.item.id === id)?.reason ?? '未装入';
</script>

<template><section class="print-sheet"><h1>行李箱空间规划单</h1><p>{{ suitcase.length }} × {{ suitcase.width }} × {{ suitcase.height }} cm · 限重 {{ suitcase.maxWeight }} kg</p><h2>{{ plan.name }}</h2><ol><li v-for="item in items" :key="item.id"><template v-if="placementOf(item.id)">□ {{ item.name }} — {{ item.weight }} kg · 放置方向 {{ placementOf(item.id)!.dimensions.length }}×{{ placementOf(item.id)!.dimensions.width }}×{{ placementOf(item.id)!.dimensions.height }} cm</template><template v-else>× {{ item.name }} — {{ reasonOf(item.id) }}</template></li></ol><h3>风险提示</h3><p v-for="risk in risks" :key="risk.id">{{ risk.title }}：{{ risk.message }}</p></section></template>
