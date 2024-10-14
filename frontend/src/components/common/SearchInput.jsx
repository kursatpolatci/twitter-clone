import { useState } from "react"
import { FaSearch } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

function SearchInput({className}) {
	const [searchText, setSearchText] = useState("")

    const navigate = useNavigate()

    const handleInputChange = (e) => {
		setSearchText(e.target.value)
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		
		navigate(`/search?search=${searchText}`)
	}
    return (
        <div className={`${className} relative`}>
            <form onSubmit={handleSubmit} className="flex items-center ">
                <div className="relative flex items-center w-full">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchText}
                        className="input input-bordered rounded-full pr-10 pl-6 w-full text-left"
                        onChange={handleInputChange}
                    />
                    <button type="submit" className=" absolute right-3"><FaSearch className="text-gray-500" /></button>
                </div>
                
            </form>
        </div>
    )
}

export default SearchInput