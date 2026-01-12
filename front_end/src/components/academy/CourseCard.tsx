import React from "react";
import { Star, Clock, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CourseCard = ({ course, progress }: any) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-primary text-xs font-bold px-2 py-1 rounded shadow-sm">
          {course.category}
        </span>
        {course.bestseller && (
          <span className="absolute top-3 right-3 bg-gold text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            BESTSELLER
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center text-xs text-gold font-bold">
            <Star className="w-3 h-3 mr-1 fill-current" /> {course.rating}{" "}
            <span className="text-gray-400 font-normal ml-1">
              ({course.reviews})
            </span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              course.level === "Beginner"
                ? "bg-green-100 text-green-700"
                : course.level === "Intermediate"
                ? "bg-orange-100 text-orange-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {course.level}
          </span>
        </div>

        <h3 className="font-heading font-bold text-primary text-lg mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
          <User className="w-3 h-3" /> {course.instructor}
        </p>

        {/* Info Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {course.duration}
          </span>
          <span className="font-bold text-primary">
            {course.price === 0 ? "FREE" : `$${course.price}`}
          </span>
        </div>

        {/* Progress Bar (si mode "My Learning") */}
        {progress !== undefined ? (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-primary">
                {progress}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <Link
              to={`/academy/course/${course.id}`}
              className="block w-full text-center bg-primary text-white text-xs font-bold py-2 rounded mt-3 hover:bg-blue-900 transition"
            >
              Continue
            </Link>
          </div>
        ) : (
          <Link
            to={`/academy/course/${course.id}`}
            className="mt-4 w-full border border-primary text-primary hover:bg-primary hover:text-white text-sm font-bold py-2 rounded transition flex items-center justify-center gap-1"
          >
            Enroll Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
