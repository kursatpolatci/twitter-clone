import { Link, useLocation } from "react-router-dom";
import { useQuery} from "@tanstack/react-query";

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner";

import SearchInput from "./SearchInput";

const RightPanel = () => {

	const location = useLocation();
	const {data: suggestedUsers, isLoading} = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const res = await fetch(`/api/users/suggested`)

				const data = await res.json()
				if (!res.ok) {
					throw new Error(data.message || "Something went wrong")
				}
				return data
			} catch (error) {
				console.error(`Error Message: ${error.message}`)
				throw new Error(`Error Message: ${error.message}`)
			}
		}
	})

	const { followMutation, isPending } = useFollow();
	return (
		<div className='hidden lg:block my-4 px-4'>
			<div className="sticky top-4">
				{location.pathname !== "/search" ? <SearchInput /> : ""}
				
				{suggestedUsers?.users.length !== 0 && 
				<div className='bg-[#16181C] p-4 rounded-md mt-5'>
					<p className='font-bold mb-2'>Who to follow</p>
					<div className='flex flex-col gap-4 '>
						{isLoading && (
							<>
								<RightPanelSkeleton />
								<RightPanelSkeleton />
								<RightPanelSkeleton />
								<RightPanelSkeleton />
							</>
						)}
						{!isLoading &&
							suggestedUsers.users?.map((user) => (
								<Link
									to={`/profile/${user.username}`}
									className='flex items-center justify-between gap-4'
									key={user._id}
								>
									<div className='flex gap-2 items-center'>
										<div className='avatar'>
											<div className='w-8 rounded-full'>
												<img src={user.profileImg || "/avatar-placeholder.png"} />
											</div>
										</div>
										<div className='flex flex-col'>
											<span className='font-semibold tracking-tight truncate w-28'>
												{user.fullName}
											</span>
											<span className='text-sm text-slate-500'>@{user.username}</span>
										</div>
									</div>
									<div>
										<button
											className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
											onClick={(e) => {
												e.preventDefault()

												followMutation(user._id)
											}}
										>
											{isPending ? <LoadingSpinner size="sm"/> : "Follow"}
										</button>
									</div>
								</Link>
							))}
					</div>
				</div>}
			</div>
		</div>
	);
};
export default RightPanel;