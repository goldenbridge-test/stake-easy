import { Play, CheckCircle, Users, Award, BookOpen, GraduationCap, Brain, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CourseCard from "../../components/academy/CourseCard";
import { categories, courses } from "../../data/academyData";

const AcademyHome = () => {
  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />

      <main className="flex-grow pt-16">
        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-primary via-blue-900 to-purple-900 text-white py-20 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-5 rounded-l-full blur-3xl"></div>
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6">
              <span className="inline-block bg-white/10 backdrop-blur px-3 py-1 rounded-full text-gold font-bold text-xs uppercase tracking-wider border border-white/20">
                🎓 Golden Academy
              </span>
              <h1 className="text-5xl font-heading font-bold leading-tight">
                Master Blockchain <br /> & Web3 Investing
              </h1>
              <p className="text-blue-100 text-lg max-w-lg">
                From blockchain basics to advanced DeFi strategies. Join 50,000+
                students and start your Web3 journey today.
              </p>
              <div className="flex gap-4 pt-4">
                <Link
                  to="/academy/catalog"
                  className="bg-gold hover:bg-gold-hover text-primary font-bold px-8 py-3.5 rounded-lg shadow-lg transition transform hover:-translate-y-1"
                >
                  Browse Courses
                </Link>
                <Link
                  to="/academy/subscriptions"
                  className="border border-white/30 hover:bg-white/10 text-white font-bold px-8 py-3.5 rounded-lg transition"
                >
                  Voir les Abonnements
                </Link>
              </div>
            </div>
            {/* Illustration Abstraite */}
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-tr from-gold to-orange-500 rounded-full blur-[100px] opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 w-full max-w-md grid grid-cols-2 gap-4 p-4">
                  {[
                    { icon: <GraduationCap className="w-10 h-10 text-gold" />, label: "Certifications" },
                    { icon: <BookOpen className="w-10 h-10 text-blue-300" />, label: "100+ Courses" },
                    { icon: <Brain className="w-10 h-10 text-purple-300" />, label: "DeFi & Web3" },
                    { icon: <TrendingUp className="w-10 h-10 text-green-300" />, label: "Investing" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/20 transition">
                      {icon}
                      <span className="text-white text-sm font-semibold">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LEARNING PATHS */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-primary">
              🚀 Choose Your Learning Path
            </h2>
            <p className="text-gray-500 mt-2">
              Structured paths to guide you from beginner to expert.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat: any) => (
              <div
                key={cat.id}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition cursor-pointer group"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${cat.color
                    .replace("text-", "bg-")
                    .replace(
                      "500",
                      "100"
                    )} flex items-center justify-center mb-4 group-hover:scale-110 transition`}
                >
                  <cat.icon className={`w-6 h-6 ${cat.color}`} />
                </div>
                <h3 className="font-bold text-lg text-primary mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {cat.count} courses available
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURED COURSES */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-heading font-bold text-primary">
                  ⭐ Featured Courses
                </h2>
                <p className="text-gray-500 mt-2">
                  Top-rated courses by our community.
                </p>
              </div>
              <Link
                to="/academy/catalog"
                className="text-gold font-bold hover:underline hidden md:block"
              >
                View All Courses →
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link
                to="/academy/catalog"
                className="text-gold font-bold hover:underline"
              >
                View All Courses →
              </Link>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-16 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Students", value: "50k+", icon: Users },
              { label: "Courses", value: "120+", icon: Play },
              { label: "Completion", value: "95%", icon: CheckCircle },
              { label: "Rating", value: "4.8★", icon: Award },
            ].map((stat, i) => (
              <div key={i}>
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-gold opacity-80" />
                <div className="text-3xl font-heading font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* BECOME AN INSTRUCTOR */}
        <section className="py-20 px-6 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-heading font-bold text-primary mb-6">
                Share Your Knowledge <br /> Become an Instructor
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Join our elite group of Web3 instructors. Share your expertise with
                students worldwide and earn from your content.
              </p>
              <Link
                to="/academy/become-instructor"
                className="bg-primary text-white font-bold px-10 py-4 rounded-xl shadow-lg hover:bg-primary-dark transition inline-block"
              >
                Apply Now
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://cdni.iconscout.com/illustration/premium/thumb/male-teacher-explaining-lesson-to-students-illustration-download-in-svg-png-gif-file-formats--person-learning-man-study-school-activities-pack-people-illustrations-3944641.png"
                alt="Teacher"
                className="w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-gold to-orange-400 rounded-2xl p-10 text-center text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-heading font-bold mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-white/90 mb-8 max-w-xl mx-auto">
                Join thousands of students mastering blockchain and Web3. Get
                unlimited access to all courses.
              </p>
              <Link
                to="/academy/subscriptions"
                className="bg-white text-orange-600 font-bold px-8 py-3 rounded-lg shadow-md hover:bg-gray-50 transition inline-block"
              >
                Voir nos Abonnements
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyHome;
