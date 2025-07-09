import imagekit from "../config/imageKit.js";
import Car from "../models/Car.js";
import User from "../models/User.js"
import Booking from "../models/Booking.js"
import fs from "fs";



// Api to change role of user
export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: "owner" })
        console.log("Id mili", _id)
        res.json({ success: true, message: "Now you can list cars" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Api to list Car

export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        let car = JSON.parse(req.body.carData);
        const imageFile = req.file;


        // Upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        })

        // For URL Generation, works for both images and videos
        var optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '1280' }, // Width resizing
                { quality: 'auto' }, // Auto compression
                { format: 'webp' } // Convert to moderb format
            ]
        });

        const image = optimizedImageUrl;
        await Car.create({ ...car, owner: _id, image })


        res.json({ success: true, message: "Car added successfully" })


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Api to list Owner Cars
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id })
        res.json({ success: true, cars })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });

    }

}

// Api to Toggle Car Availability 
export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body
        const car = await Car.findById(carId)

        // Checking is car belongs to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });

        }

        car.isAvailable = !car.isAvailable;
        await car.save()

        res.json({ success: true, message: "Availability Toggled" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })

    }

}

// is Avaliable check 

// Api to  Delete Cars

export const deleteCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body
        const car = await Car.findById(carId)

        // Checking is car belongs to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });

        }

        car.owner = null;
        await car.save()

        res.json({ success: true, message: " Car removed" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "error.message" })

    }

}


// Api to get DashBoard Data
export const getDashBoardData = async (req, res) => {
    try {
        const { _id, role } = req.user;

        if (role !== 'owner') {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const cars = await Car.find({ owner: _id });
        const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });
        const pendingBookings = await Booking.find({ owner: _id, status: "pending" });
        const completedBookings = await Booking.find({ owner: _id, status: "confirmed" });

        // ✅ FIX: Assign monthlyRevenue to a variable
        const monthlyRevenue = bookings
            .filter(booking => booking.status === 'confirmed')
            .reduce((acc, booking) => acc + booking.price, 0);

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 3),
            monthlyRevenue // now correctly included
        };

        res.json({ success: true, dashboardData });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};



// Api to update user image

export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;
        const imageFile = req.file;

        // Upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })

        // For URL Generation, works for both images and videos
        var optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '1280' }, // Width resizing
                { quality: 'auto' }, // Auto compression
                { format: 'webp' } // Convert to moderb format
            ]
        });

        const image = optimizedImageUrl;

        await User.findByIdAndUpdate(_id, { image });
        res.json({ success: true, message: "Image Updated" });



    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}




