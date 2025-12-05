const moment = require("moment")
const User = require("../models/User/user.model");
const Salon = require("../models/User/salon-owner.model");
const Appointment = require("../models/Appointment/appointment.model");
const SalonService = require("../models/Service/salon-service.model")
const { validateZipCode } = require("../utils/util")

const getUserById = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');
    return user;
}

const updateUser = async (userId, updateData) => {
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('No data provided for update');
    }

    const isValidUser = await getUserById(userId);
    if (!isValidUser) {
        throw new Error('User not found');
    }

    const zip = await validateZipCode(updateData.zipcode)
    if (!zip.status) throw new Error("Please enter a valid zipcode")

    const { lat, lng } = zip
    updateData.location = {
        type: "Point",
        coordinates: [lng, lat],
    };

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) throw new Error('User not found or update failed');
    return user;
}

const updateSalon = async (userId, updateData) => {
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('No data provided for update');
    }

    const isValidUser = await getUserById(userId);
    if (!isValidUser) {
        throw new Error('User not found');
    }

    const zip = await validateZipCode(updateData.zipcode)
    if (!zip.status) throw new Error("Please enter a valid zipcode")

    const { lat, lng } = zip
    updateData.location = {
        type: "Point",
        coordinates: [lng, lat],
    };

    const salon = await Salon.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
    if (!salon) throw new Error('User not found or update failed');
    return salon;
}

// const getAllSalons = async (page = 1, limit = 10, sort = "newest") => {
//     const skip = (page - 1) * limit;
//     const sortOrder = sort === "oldest" ? 1 : -1;
//     const filter = { role: "salon-owner", status: "approved" };
//     const total = await User.countDocuments(filter);
//     const salons = await User.find(filter)
//         .select(
//             "profilePic salonName description startTime endTime salonPhotos workingDays salonZipcode salonAddress phoneNumber"
//         )
//         .sort({ updatedAt: sortOrder })
//         .skip(skip)
//         .limit(limit)
//         .lean();
//     const salonIds = salons.map((s) => s._id);
//     const allServices = await SalonService.find({
//         salonId: { $in: salonIds },
//     }).lean();
//     const servicesBySalon = {};
//     allServices.forEach((service) => {
//         if (!servicesBySalon[service.salonId]) {
//             servicesBySalon[service.salonId] = [];
//         }
//         servicesBySalon[service.salonId].push(service);
//     });
//     const salonsWithExtras = salons.map((salon) => ({
//         ...salon,
//         distance: "5 miles away",
//         services: servicesBySalon[salon._id] || [],
//     }));
//     return {
//         items: salonsWithExtras,
//         total: total,
//         page,
//         pages: Math.ceil(total / limit),
//         sort,
//     };
// };


const getAllSalons = async ({
    page = 1,
    limit = 10,
    sort = null,
    userLat = null,
    userLng = null,
    distance = null, // miles
    search = ""
}) => {
    const skip = (page - 1) * limit;

    const filter = {
        role: "salon-owner",
        status: "approved",
        ...(search
            ? { salonName: { $regex: search, $options: "i" } }
            : {})
    };

    let salons = [];
    let total = 0;

    if (userLat && userLng) {
        const userLocation = [userLng, userLat];

        const aggregatePipeline = [
            // 1) GEO NEAR (must be first)
            {
                $geoNear: {
                    near: { type: "Point", coordinates: userLocation },
                    distanceField: "distance",
                    spherical: true,
                    query: filter,
                },
            },

            // 2) If distance is provided → filter by MILES
            ...(distance
                ? [
                    {
                        $match: {
                            distance: { $lte: distance * 1609.34 } // miles → meters
                        }
                    }
                ]
                : []),

            // 3) If NO distance filter → apply sort based on nearest/farthest
            ...(distance
                ? [] // skip sorting when distance filter is active
                : [
                    ...(sort === "nearest"
                        ? [{ $sort: { distance: 1 } }]
                        : sort === "farthest"
                            ? [{ $sort: { distance: -1 } }]
                            : []) // if sort is null or invalid → add no sort stage
                ]),

            // 4) Pagination
            { $skip: skip },
            { $limit: limit },

            // 5) Populate services
            {
                $lookup: {
                    from: "salonservices",
                    localField: "_id",
                    foreignField: "salonId",
                    as: "services",
                },
            },

            // 6) Format distance (convert meters → miles & append "miles away")
            {
                $project: {
                    profilePic: 1,
                    salonName: 1,
                    description: 1,
                    startTime: 1,
                    endTime: 1,
                    salonPhotos: 1,
                    workingDays: 1,
                    salonZipcode: 1,
                    salonAddress: 1,
                    phoneNumber: 1,
                    services: 1,
                    email: 1,

                    // Format distance in miles
                    distance: {
                        $concat: [
                            {
                                $toString: {
                                    $round: [
                                        { $divide: ["$distance", 1609.34] }, // meters → miles
                                        1
                                    ]
                                }
                            },
                            " miles away"
                        ]
                    }
                }
            }
        ];

        salons = await User.aggregate(aggregatePipeline);

        // When distance filter is used, aggregated result count is the total
        total = distance
            ? salons.length
            : await User.countDocuments(filter);
    }

    return {
        items: salons,
        total,
        page,
        pages: Math.ceil(total / limit),
        sort,
    };
};


const getSalonById = async (salonId) => {
    const salon = await Salon.findById(salonId);
    const services = await SalonService.find({ salonId: salonId });
    const salonWithServices = {
        ...salon._doc,
        services,
        distance: "5 miles away",
    };
    if (!salon) throw new Error("Salon not found");
    return salonWithServices;
};
const getSalonDailyStats = async (salonId) => {

    const startOfDayStr = moment().startOf("day").format("YYYY-MM-DD");
    const endOfDayStr = moment().endOf("day").format("YYYY-MM-DD");

    const [
        appointmentsCount,
        totalServicesCount
    ] = await Promise.all([

        Appointment.countDocuments({
            "Salon.id": salonId,
            appointmentDate: {
                $gte: startOfDayStr,
                $lte: endOfDayStr,
            },
        }),

        SalonService.countDocuments({
            salonId: salonId
        }),

    ]);

    return {
        appointmentsCount,
        totalServicesCount
    };
};


module.exports = {
    getUserById,
    updateUser,
    updateSalon,
    getAllSalons,
    getSalonById,
    getSalonDailyStats
};