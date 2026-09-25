<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {{ editManga ? 'Edit Manga' : 'New Manga' }}
      </h2>
      
      <form @submit.prevent="save" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input v-model="form.title" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Volume</label>
          <div class="relative mt-1">
            <input
              v-model="volumeSearchQuery"
              type="search"
              role="combobox"
              aria-label="Search and select a volume"
              aria-autocomplete="list"
              aria-controls="available-volume-options"
              :aria-expanded="showVolumeOptions"
              :placeholder="`Volume ${form.volume || ''} · Search volumes...`"
              autocomplete="off"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              @focus="openVolumeSelector"
              @input="showVolumeOptions = true"
              @keydown.esc.prevent="showVolumeOptions = false"
              @keydown.enter.prevent="selectFirstVolume"
              @blur="closeVolumeSelector"
            >
            <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400" aria-hidden="true">⌕</span>
            <div
              v-if="showVolumeOptions"
              id="available-volume-options"
              role="listbox"
              class="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
            >
              <p v-if="volumeSearchLoading" class="px-3 py-2 text-sm text-gray-500" role="status">Loading available volumes…</p>
              <p v-else-if="!form.title.trim()" class="px-3 py-2 text-sm text-gray-500">Enter a manga title first.</p>
              <button
                v-for="availableVolume in filteredVolumes"
                :key="availableVolume.volume"
                type="button"
                role="option"
                :aria-selected="form.volume === availableVolume.volume"
                class="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                @click="selectAvailableVolume(availableVolume)"
              >
                Volume {{ availableVolume.volume }} <span class="text-gray-500">· {{ localeLabel(availableVolume.locale) }}</span>
              </button>
              <p v-if="!volumeSearchLoading && form.title.trim() && filteredVolumes.length === 0 && !isManualVolumeQuery" class="px-3 py-2 text-sm text-gray-500">No matching volumes found.</p>
              <button
                v-if="!volumeSearchLoading && isManualVolumeQuery"
                type="button"
                role="option"
                class="block w-full px-3 py-2 text-left text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none dark:text-indigo-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                @click="useManualVolume"
              >
                Use volume {{ manualVolumeValue }} without a catalog cover
              </button>
            </div>
          </div>
          <p v-if="volumeSearchLoading" class="text-sm text-gray-500 dark:text-gray-400 mt-1" role="status">Searching available MangaDex volumes…</p>
          <p v-else-if="volumeMessage" class="text-sm text-gray-600 dark:text-gray-400 mt-1" role="status">{{ volumeMessage }}</p>
          <p v-if="coverError" class="text-sm text-amber-600 dark:text-amber-400 mt-1">{{ coverError }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Author</label>
          <input v-model="form.author" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Genre</label>
          <input v-model="form.genre" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
          <input v-model.number="form.stock" type="number" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Sale Price ($)</label>
          <input v-model.number="form.price" type="number" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rental Price ($)</label>
          <input v-model.number="form.rentalPrice" type="number" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <!-- Description field removed as per user request -->
        <!-- <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea v-model="form.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
        </div> -->
        <div class="md:col-span-2 flex justify-end items-center gap-4">
          <img v-if="form.coverImage" :src="form.coverImage" alt="Cover Preview" class="h-16 w-12 object-cover rounded shadow-sm border">
          <button 
            type="button" 
            @click="close"
            class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {{ editManga ? 'Update Manga' : 'Create Manga' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AvailableMangaVolume, Manga, MangaInput } from '../types/Manga';
import { useMangaStore } from '../stores/mangaStore';

const props = defineProps<{
  isOpen: boolean;
  editManga: Manga | null;
}>();

const emit = defineEmits(['close', 'save']);
const store = useMangaStore();
const coverError = ref('');
const volumeSearchLoading = ref(false);
const volumeMessage = ref('');
const availableVolumes = ref<AvailableMangaVolume[]>([]);
const volumeSearchQuery = ref('');
const showVolumeOptions = ref(false);
const filteredVolumes = computed(() => {
  const query = volumeSearchQuery.value.replace(/^volume\s*/i, '').trim();
  if (!query) return availableVolumes.value;
  return availableVolumes.value.filter((item) => String(item.volume).includes(query));
});
const manualVolumeValue = computed(() => Number(volumeSearchQuery.value.replace(/^volume\s*/i, '').trim()));
const isManualVolumeQuery = computed(() =>
  /^\d+(?:\.\d+)?$/.test(volumeSearchQuery.value.replace(/^volume\s*/i, '').trim())
  && manualVolumeValue.value >= 1
  && !availableVolumes.value.some((item) => item.volume === manualVolumeValue.value)
);

const form = ref<MangaInput>({
  title: '',
  volume: 1,
  author: '',
  genre: '',
  price: 0,
  rentalPrice: 0,
  stock: 0,
  description: '',
  coverImage: '',
  status: '',
  malScore: undefined,
  malId: undefined,
  mangaDexId: undefined
});

watch(() => props.editManga, (newManga) => {
  if (newManga) {
    form.value = {
      title: newManga.title,
      volume: newManga.volume,
      author: newManga.author,
      genre: newManga.genre,
      price: newManga.price,
      rentalPrice: newManga.rentalPrice,
      stock: newManga.stock,
      description: newManga.description || '',
      coverImage: newManga.coverImage || '',
      status: newManga.status || '',
      malScore: newManga.malScore,
      malId: newManga.malId,
      mangaDexId: newManga.mangaDexId
    };
  } else {
    // Reset form
    form.value = {
      title: '',
      volume: 1,
      author: '',
      genre: '',
      price: 0,
      rentalPrice: 0,
      stock: 0,
      description: '',
      coverImage: '',
      status: '',
      malScore: undefined,
      malId: undefined,
      mangaDexId: undefined
    };
  }
  availableVolumes.value = [];
  volumeMessage.value = '';
  coverError.value = '';
  volumeSearchQuery.value = form.value.volume ? `Volume ${form.value.volume}` : '';
  showVolumeOptions.value = false;
}, { immediate: true });

watch(() => form.value.title, (newTitle, previousTitle) => {
  if (newTitle !== previousTitle) {
    availableVolumes.value = [];
    volumeMessage.value = '';
  }
});

const close = () => {
  emit('close');
};

const save = () => {
  emit('save', { ...form.value });
};

const loadVolumes = async () => {
  if (!form.value.title.trim() || volumeSearchLoading.value || availableVolumes.value.length) return;
  volumeSearchLoading.value = true;
  volumeMessage.value = '';
  coverError.value = '';
  try {
    const result = await store.searchMangaVolumes({
      title: form.value.title,
      author: form.value.author,
      malId: form.value.malId,
      mangaDexId: form.value.mangaDexId
    });
    if (!result) {
      coverError.value = store.error || 'Could not search this manga’s volumes.';
      return;
    }
    form.value.mangaDexId = result.mangaDexId;
    availableVolumes.value = result.volumes;
    volumeMessage.value = result.volumes.length
      ? `${result.volumes.length} volumes available.`
      : 'No volume-specific covers found. You can still enter the volume manually.';
  } finally {
    volumeSearchLoading.value = false;
  }
};

const selectAvailableVolume = (selectedVolume: AvailableMangaVolume) => {
  form.value.volume = selectedVolume.volume;
  form.value.coverImage = selectedVolume.coverImage;
  volumeSearchQuery.value = `Volume ${selectedVolume.volume}`;
  coverError.value = '';
  volumeMessage.value = `Volume ${selectedVolume.volume} cover selected · ${localeLabel(selectedVolume.locale)}.`;
  showVolumeOptions.value = false;
};

const useManualVolume = () => {
  if (!isManualVolumeQuery.value) return;
  form.value.volume = manualVolumeValue.value;
  form.value.coverImage = '';
  volumeSearchQuery.value = `Volume ${manualVolumeValue.value}`;
  volumeMessage.value = 'Manual volume selected. No catalog cover is available for it.';
  coverError.value = '';
  showVolumeOptions.value = false;
};

const openVolumeSelector = () => {
  volumeSearchQuery.value = '';
  showVolumeOptions.value = true;
  void loadVolumes();
};

const closeVolumeSelector = () => {
  setTimeout(() => {
    showVolumeOptions.value = false;
    if (!volumeSearchQuery.value.trim()) {
      volumeSearchQuery.value = form.value.volume ? `Volume ${form.value.volume}` : '';
    }
  }, 120);
};

const selectFirstVolume = () => {
  if (filteredVolumes.value[0]) {
    selectAvailableVolume(filteredVolumes.value[0]);
    return;
  }
  if (isManualVolumeQuery.value) useManualVolume();
};

const localeLabel = (locale: string): string => {
  if (locale === 'es' || locale === 'es-la') return 'Español';
  if (locale === 'en') return 'English';
  return locale.toUpperCase();
};

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && form.value.title.trim()) void loadVolumes();
});

</script>
