import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

function useFollow() {
  const queryClient = useQueryClient();

  const {
    mutate: followMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`/api/users/follow/${userId}`, {
          method: 'POST',
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Something went wrong');
        }
        return data;
      } catch (error) {
        console.error(`Error Message: ${error.message}`);
        throw new Error(`Error Message: ${error.message}`);
      }
    },
    onSuccess: () => {
      toast.success('Following/Unfollowing successfully');
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['suggestedUsers'] }),
        queryClient.invalidateQueries({ queryKey: ['authUser'] }),
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { followMutation, isPending };
}

export default useFollow;
