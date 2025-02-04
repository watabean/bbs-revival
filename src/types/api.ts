export type Thread = {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  posts: Post[];
  filteredPosts?: Post[];
};

export type Post = {
  id: number;
  author: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  postNumber?: number;
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

export type ThreadListResponse = {
  threads: Thread[];
  pagination: Pagination;
};

export type PostListResponse = {
  thread: Thread;
  pagination: Pagination;
};
