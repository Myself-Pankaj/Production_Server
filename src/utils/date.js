export default {
    formatDate: (dateString, showTime = false) => {
        try {
            const date = new Date(dateString)

            if (isNaN(date.getTime())) {
                throw new Error('Invalid date')
            }

            const options = showTime
                ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }
                : { year: 'numeric', month: 'long', day: 'numeric' }

            return new Intl.DateTimeFormat('en-US', options).format(date)
        } catch (error) {
            // console.error('Error formatting date:', error)
            // return 'Invalid Date'
            return error
        }
    },

    formatShortDate: (dateString) => {
        try {
            const date = new Date(dateString)

            if (isNaN(date.getTime())) {
                throw new Error('Invalid date')
            }

            const day = date.getDate()
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const month = monthNames[date.getMonth()]
            const year = date.getFullYear()

            return `${day} ${month} ${year}`
        } catch (error) {
            // console.error('Error formatting short date:', error)
            // return 'Invalid Date'
            return error
        }
    }
}
