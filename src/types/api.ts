export type Thread = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  posts: Post[];
  postsCount: number;
};

export type Post = {
  id: string;
  content: string;
  createdAt: Date;
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
