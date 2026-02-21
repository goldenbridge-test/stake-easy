import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CourseCard from "../../components/academy/CourseCard";
import { enrollmentsApi, analyticsApi } from "../../services/api";
import { Trophy, Flame, Clock, Loader2 } from "lucide-react";

const MyLearning = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollData, statsData] = await Promise.all([
          enrollmentsApi.list(),
          analyticsApi.mySummary()
        ]);
        setEnrollments(enrollData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch learning data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* HEADER PROGRESS */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-primary mb-2">
                My Learning Journey
              </h1>
              <p className="text-gray-500">
                Keep up the good work! You've learned a lot this week.
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold flex justify-center items-center gap-1">
                  <Flame className="fill-gold" /> {stats?.streak || 0}
                </div>
                <div className="text-xs text-gray-400 uppercase font-bold">
                  Day Streak
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500 flex justify-center items-center gap-1">
                  <Trophy /> {stats?.certificates || 0}
                </div>
                <div className="text-xs text-gray-400 uppercase font-bold">
                  Certificates
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500 flex justify-center items-center gap-1">
                  <Clock /> {Math.round(stats?.total_spent) || 0}
                </div>
                <div className="text-xs text-gray-400 uppercase font-bold">
                  Total Spent
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-gold animate-spin" />
            </div>
          ) : (
            <>
              {/* CONTINUE WATCHING */}
              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-6">
                  Continue Learning
                </h2>
                {enrollments.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((en) => (
                      <CourseCard
                        key={en.id}
                        course={en.course_detail}
                        progress={en.progress}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
                    <p className="text-gray-400 mb-4">You haven't enrolled in any courses yet.</p>
                    <a href="/academy/catalog" className="text-gold font-bold hover:underline">
                      Browse Catalog
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {/* RECOMMENDED */}
          <div className="pt-8 border-t border-gray-200">
            <h2 className="text-xl font-heading font-bold text-primary mb-6">
              Recommended for You
            </h2>
            <div className="bg-blue-50 p-8 rounded-xl text-center">
              <p className="text-gray-500 mb-4">
                Based on your interest in DeFi, we recommend:
              </p>
              <button className="bg-white text-primary border border-primary font-bold px-6 py-2 rounded-lg hover:bg-blue-50">
                Explore Advanced DeFi Strategies
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyLearning;
