import { create } from 'zustand';

type DiscoverState = {
  activeCategory: string;
  searchQuery: string;
  activeFeaturedIndex: number;
  bookmarks: string[];
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveFeaturedIndex: (index: number) => void;
  toggleBookmark: (id: string) => void;
};

export const useDiscoverStore = create<DiscoverState>((set) => ({
  activeCategory: 'All',
  searchQuery: '',
  activeFeaturedIndex: 0,
  bookmarks: [],
  setActiveCategory: (category) => set({ activeCategory: category, activeFeaturedIndex: 0 }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFeaturedIndex: (index) => set({ activeFeaturedIndex: index }),
  toggleBookmark: (id) =>
    set((state) => ({
      bookmarks: state.bookmarks.includes(id)
        ? state.bookmarks.filter((bookmarkId) => bookmarkId !== id)
        : [...state.bookmarks, id],
    })),
}));
