import { writable, derived } from 'svelte/store';

export const mapData = writable([]);

export const activeMaps = derived(mapData, ($mapData) => {
    if ($mapData.maps) {
        return $mapData.maps;
    }
    return [];
})
