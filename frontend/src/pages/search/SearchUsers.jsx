import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"

import SearchInput from "../../components/common/SearchInput"
import useFollow from "../../hooks/useFollow"
import LoadingSpinner from "../../components/common/LoadingSpinner"

function SearchUsers() {
  const location = useLocation()

  const getQueryParam = (param) => {
    const query = new URLSearchParams(location.search)
    return query.get(param)
  }

  const searchQuery = getQueryParam('search')

  const { data: searchedData, isLoading: isSearching, refetch, isRefetching, isError, error } = useQuery({
    queryKey: ["search"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/search?search=${searchQuery}`)

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message || "Something went wrong")
        }
        return data
      } catch (error) {
        console.error(`Error Message: ${error.message}`)
        throw new Error(error.message)
      }
    },
    retry: false,
    enabled: !!searchQuery
  })
  const { data: authUser, isLoading } = useQuery({ queryKey: ["authUser"] })

  const { followMutation, isPending } = useFollow()

  useEffect(() => {
    refetch()
  }, [searchQuery, refetch, authUser])
  return (
    <div className='flex-[4_4_0] md:max-w-2xl border-r border-gray-700 min-h-screen md:px-12 px-4'>

      <SearchInput className={' mt-5'} />

      <div className="flex flex-col gap-y-12  mt-12">
        {(isRefetching || isSearching || isLoading) &&
          <div className="h-screen flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>}
        {isError &&
          <div className="text-gray-600 text-center">
            <p>{error.message}</p>
          </div>
        }
        {!isError && !isSearching && !isRefetching && searchedData?.users?.length === 0 &&
          <div className="text-gray-600 text-center">
            <p>No search result</p>
          </div>
        }
        {!isError && !isSearching && !isRefetching && searchedData?.users?.map((user, index) => (
          <div className='bg-[#16181C] hover:bg-[#060607] transition-colors duration-300 p-4 rounded-lg' key={index}>
            <div className='flex flex-col gap-4'>
              <Link
                to={`/profile/${user.username}`}
                className='flex items-center justify-between gap-4'
                key={user._id}
              >
                <div className='flex gap-2 items-center'>
                  <div className='avatar'>
                    <div className='md:w-12 w-9 rounded-full'>
                      <img src={user.profileImg || "/avatar-placeholder.png"} alt="Profile" />
                    </div>
                  </div>
                  <div className='flex flex-col pl-2'>
                    <span className='font-semibold tracking-tight truncate w-28 md:text-base text-sm'>
                      {user.fullName}
                    </span>
                    <span className='md:text-base text-sm text-slate-500 '>@{user.username}</span>
                  </div>
                </div>
                <div>
                  {authUser.user._id !== user._id && <button
                    className='btn bg-white text-black md:text-[1rem] text-[0.7rem] hover:bg-white hover:opacity-90 rounded-full sm:btn-md btn-sm'
                    onClick={(e) => {
                      e.preventDefault();
                      followMutation(user._id);
                    }}
                  >
                    {isPending ? <LoadingSpinner size="sm" /> : (
                      authUser.user.following.includes(user._id) ? "Unfollow" : "Follow"
                    )}
                  </button>}
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default SearchUsers