import React, { useState } from "react";
import { Filter, Search } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CourseCard from "../../components/academy/CourseCard";
import { courses, categories } from "../../data/academyData";

const AcademyCatalog = () => {
  const [filterLevel, setFilterLevel] = useState("All");

  // Filtrage simple (pour la démo)
  const filteredCourses =
    filterLevel === "All"
      ? courses
      : courses.filter((c) => c.level === filterLevel);

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-heading font-bold text-primary">
              All Courses
            </h1>
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search for a topic..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* SIDEBAR FILTERS */}
            <div className="hidden lg:block space-y-8">
              <div>
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-primary"
                    >
                      <input
                        type="checkbox"
                        className="rounded text-gold focus:ring-gold"
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-primary mb-4">Level</h3>
                <div className="space-y-2">
                  {["All", "Beginner", "Intermediate", "Advanced"].map(
                    (level) => (
                      <label
                        key={level}
                        className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-primary"
                      >
                        <input
                          type="radio"
                          name="level"
                          checked={filterLevel === level}
                          onChange={() => setFilterLevel(level)}
                          className="text-gold focus:ring-gold"
                        />
                        {level}
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* GRID COURSES */}
            <div className="lg:col-span-3">
              <div className="mb-4 text-sm text-gray-500">
                Showing {filteredCourses.length} results
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center gap-2">
                <button className="px-4 py-2 bg-primary text-white rounded-lg font-bold">
                  1
                </button>
                <button className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">
                  2
                </button>
                <button className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyCatalog;
