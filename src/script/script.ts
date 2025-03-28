const API_URL = "https://dummyjson.com/posts";
const LIMIT = 35; // Number of posts per fetch
let skip = 0; // Track how many posts are loaded
let hasMore = true; // Control if more posts exist

interface Post {
  id: number;
  title: string;
  body: string;
}

// Select elements
const postContainer = document.getElementById(
  "postContainer"
) as HTMLDivElement;
const titleInput = document.getElementById("title") as HTMLInputElement;
const bodyInput = document.getElementById("body") as HTMLInputElement;
const searchInput = document.getElementById("search") as HTMLInputElement;
const saveButton = document.getElementById("savePost") as HTMLButtonElement;

let editingPostId: number | null = null;

// Fetch and display posts with pagination
const fetchPosts = async () => {
  if (!hasMore) return;

  try {
    const response = await fetch(`${API_URL}?limit=${LIMIT}&skip=${skip}`);
    const data = await response.json();

    if (data.posts.length < LIMIT) {
      hasMore = false; // Stop fetching when no more posts
    }

    displayPosts(data.posts);
    skip += LIMIT;
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// Display posts in UI
const displayPosts = (posts: Post[]) => {
  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "post";
    postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            <button onclick="editPost(${post.id}, '${post.title}', '${post.body}')">Edit</button>
            <button onclick="deletePost(${post.id})">Delete</button>
        `;
    postContainer.appendChild(postElement);
  });
};


// Reset and fetch posts again (for adding or editing)
const resetAndFetch = () => {
  postContainer.innerHTML = "";
  skip = 0;
  hasMore = true;
  fetchPosts();
};

// Infinite scrolling detection
const handleScroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    fetchPosts();
  }
};

// Event Listeners
window.addEventListener("scroll", handleScroll);
window.onload = fetchPosts;
