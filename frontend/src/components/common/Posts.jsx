import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";

import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect } from "react";

const Posts = ({feedType, username, userId}) => {

	const getPostEndPoint = () => {
		switch (feedType) {
			case "following":
				return "/api/posts/following"
			case "forYou":
				return "/api/posts/all"
			case "posts":
				return `/api/posts/user/${username}`
			case "likes":
				return `/api/posts/likes/${userId}`
			default:
				return "/api/posts/all"
		}
	}

	const POST_ENDPOINT = getPostEndPoint();

	const {data: posts, isLoading, isError, error, refetch, isRefetching} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT)

				const data = await res.json();
				
				if (!res.ok) {
					throw new Error(data.message || "Something went wrong")
				}
				console.log("data")
				return data
			} catch (error) {
				console.error(`Error message: ${error.message}`)
				throw new Error(`Error message: ${error.message}`)
			}
		}
	})

	useEffect(() => {
		refetch()
	}, [refetch, feedType, username, userId])
	return (
		<>
			{(isLoading || isRefetching)  && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.feedPosts.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && posts?.feedPosts && (
				<div>
					{posts.feedPosts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;