import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "CEO",
    company: "StyleHub Boutique",
    content: "This platform transformed our business. We've seen a 40% increase in sales since implementing the AI-powered recommendations. The analytics dashboard gives us insights we never had before.",
    rating: 5,
    image: "SJ"
  },
  {
    name: "Michael Chen",
    role: "Operations Manager",
    company: "TechGear Express",
    content: "The inventory management system alone saved us countless hours. We've reduced stockouts by 60% and our customers are happier than ever. The automated reordering is a game-changer.",
    rating: 5,
    image: "MC"
  },
  {
    name: "Emily Rodriguez",
    role: "Founder",
    company: "Artisan Home Goods",
    content: "As a small business owner, I needed something powerful but easy to use. This platform delivered both. The support team is incredible, and the pricing is fair for businesses of all sizes.",
    rating: 5,
    image: "ER"
  },
  {
    name: "David Kim",
    role: "E-commerce Director",
    company: "Global Fashion Co",
    content: "We migrated from a legacy system and couldn't be happier. The AI insights help us predict trends and stock accordingly. Our conversion rates have improved by 25%.",
    rating: 5,
    image: "DK"
  },
  {
    name: "Lisa Thompson",
    role: "Marketing Lead",
    company: "Beauty Bliss",
    content: "The customer analytics and segmentation features are incredible. We've been able to create targeted campaigns that convert. The ROI has been phenomenal.",
    rating: 5,
    image: "LT"
  }
];

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToTestimonial = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  const goToPrevious = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      setIsAnimating(false);
    }, 300);
  };

  const goToNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setIsAnimating(false);
    }, 300);
  };

  const testimonial = testimonials[currentIndex];

  return (
    <div className="relative">
      <Card className="shadow-lg border-2">
        <CardContent className="p-8 md:p-12">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <Quote className="w-12 h-12 text-blue-500 mb-6 opacity-50" />
            <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
              "{testimonial.content}"
            </p>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl">
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-semibold text-lg text-slate-900 dark:text-slate-100">{testimonial.name}</p>
                  <p className="text-slate-600 dark:text-slate-400">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToTestimonial(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-blue-500 w-8'
                : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Previous testimonial"
      >
        <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Next testimonial"
      >
        <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
