<script setup lang="ts">
import { computed } from 'vue';
import type { PackingItem, PackingPlan, Risk, Suitcase } from '../../core/models';
const props = defineProps<{ suitcase: Suitcase; items: PackingItem[]; plan: PackingPlan; risks: Risk[] }>();
const placements = computed(() => new Map(props.plan.placements.map((placement) => [placement.itemId, placement])));
const unplacedReasons = computed(() => new Map(props.plan.unplaced.map(({ item, reason }) => [item.id, reason])));
</script>

<template><section class="print-sheet"><h1>行李箱空间规划单</h1><p>{{ suitcase.length }} × {{ suitcase.width }} × {{ suitcase.height }} cm · 限重 {{ suitcase.maxWeight }} kg</p><h2>{{ plan.name }}</h2><ol><li v-for="item in items" :key="item.id"><template v-if="placements.get(item.id)">□ {{ item.name }} — {{ item.weight }} kg · 放置方向 {{ placements.get(item.id)!.dimensions.length }}×{{ placements.get(item.id)!.dimensions.width }}×{{ placements.get(item.id)!.dimensions.height }} cm</template><template v-else>× {{ item.name }} — {{ item.weight }} kg · 未装入：{{ unplacedReasons.get(item.id) ?? '' }}</template></li></ol><h3>风险提示</h3><p v-for="risk in risks" :key="risk.id">{{ risk.title }}：{{ risk.message }}</p></section></template>
