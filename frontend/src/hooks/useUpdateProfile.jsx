import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

function useUpdateProfile() {

    const queryClient = useQueryClient()

    const {mutate: updateProfileMutation, isPending: isUpdatingProfile, error: updateError} = useMutation({
        mutationFn: async (formData) => {
            try {
                const res = await fetch(`/api/users/update`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                })

                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.message || "Something went wrong")
                }
                return data
            } catch (error) {
                console.error(`Error message: ${error.message}`)
				throw new Error(`Error message: ${error.message}`)
            }
        },
        onSuccess: () => {
            Promise.all([
                queryClient.invalidateQueries({queryKey: ["authUser"]}),
                queryClient.invalidateQueries({queryKey: ["userProfile"]})
            ])
        },
        onError: (updateError) => {
            toast.error(updateError.message)
        }
    })

    return { updateProfileMutation, isUpdatingProfile }
}

export default useUpdateProfile