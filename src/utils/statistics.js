export const calculateTotalRevenue = (orders) => {
    return orders.reduce((total, order) => total + (order.bookingAmount || 0), 0)
}

export const calculatePercentage = (current, previous) => {
    if (previous === 0) return 100 // To avoid division by zero
    return Math.round(((current - previous) / previous) * 100)
}

export const processLastSixMonths = (orders, today) => {
    const orderMonthCounts = new Array(6).fill(0)
    const orderMonthlyRevenue = new Array(6).fill(0)

    orders.forEach((order) => {
        const monthDiff = (today.getMonth() - order.createdAt.getMonth() + 12) % 12
        if (monthDiff < 6) {
            orderMonthCounts[6 - monthDiff - 1] += 1
            orderMonthlyRevenue[6 - monthDiff - 1] += order.bookingAmount || 0
        }
    })

    return { orderMonthCounts, orderMonthlyRevenue }
}
