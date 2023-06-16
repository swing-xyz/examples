import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useInView } from "framer-motion";

import { Container } from "./Container";

const reviews = [
  {
    title: "It really works.",
    body: "I bought Altcoin today and turned $5000 into $25,000 in half an hour.",
    author: "CrazyInvestor",
    rating: 5,
  },
  {
    title: "You need this altcoin.",
    body: "I didnt understand the stock market at all before Altcoin. I still dont, but at least Im rich now.",
    author: "CluelessButRich",
    rating: 5,
  },
  {
    title: "This shouldnt be legal.",
    body: "Altcoin makes it so easy to win big in the stock market that I cant believe its actually legal.",
    author: "LivingDaDream",
    rating: 5,
  },
  {
    title: "Screw financial advisors.",
    body: "I barely made any money investing in mutual funds. With Altcoin, Im doubling my net-worth every single month.",
    author: "JordanBelfort1962",
    rating: 5,
  },
  {
    title: "I love it!",
    body: "I started providing insider information myself and now I get new insider tips every 5 minutes. I dont even have time to act on all of them. New Lamborghini is being delivered next week!",
    author: "MrBurns",
    rating: 5,
  },
  {
    title: "Too good to be true.",
    body: "I was making money so fast with Altcoin that it felt like a scam. But I sold my shares and withdrew the money and its really there, right in my bank account. This altcoin is amazing!",
    author: "LazyRich99",
    rating: 5,
  },
  {
    title: "Wish I could give 6 stars",
    body: "This is literally the most important app you will ever download in your life. Get on this before its so popular that everyone else is getting these tips too.",
    author: "SarahLuvzCash",
    rating: 5,
  },
  {
    title: "Bought an island.",
    body: "Yeah, you read that right. Want your own island too? Get Altcoin.",
    author: "ScroogeMcduck",
    rating: 5,
  },
  {
    title: "No more debt!",
    body: "After 2 weeks of trading on Altcoin I was debt-free. Why did I even go to school at all when Altcoin exists?",
    author: "BruceWayne",
    rating: 5,
  },
  {
    title: "Im 13 and Im rich.",
    body: "I love that with Altcoins transaction anonymization I could sign up and start trading when I was 12 years old. I had a million dollars before I had armpit hair!",
    author: "RichieRich",
    rating: 5,
  },
  {
    title: "Started an investment firm.",
    body: "I charge clients a 3% management fee and just throw all their investments into Altcoin. Easy money!",
    author: "TheCountOfMonteChristo",
    rating: 5,
  },
  {
    title: "Its like a superpower.",
    body: "Every tip Altcoin has sent me has paid off. Its like playing Blackjack but knowing exactly what card is coming next!",
    author: "ClarkKent",
    rating: 5,
  },
  {
    title: "Quit my job.",
    body: "I downloaded Altcoin three days ago and quit my job today. I cant believe no one else thought to build a stock trading app that works this way!",
    author: "GeorgeCostanza",
    rating: 5,
  },
  {
    title: "$ALTCOIN to moon!",
    body: "Unless you want to have the best life ever! I am literally writing this from a spaceship.",
    author: "JeffBezos",
    rating: 5,
  },
];

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {/* @ts-ignore */}
      {[...Array(5).keys()].map((index) => (
        <StarIcon
          key={index}
          className={clsx(
            "w-5 h-5",
            rating > index ? "fill-cyan-500" : "fill-gray-300"
          )}
        />
      ))}
    </div>
  );
}

function Review({
  title,
  body,
  author,
  rating,
  className,
  ...props
}: {
  title?: string;
  body?: string;
  author?: string;
  rating: number;
  className?: string;
}) {
  let animationDelay = useMemo(() => {
    let possibleAnimationDelays = [
      "0s",
      "0.1s",
      "0.2s",
      "0.3s",
      "0.4s",
      "0.5s",
    ];
    return possibleAnimationDelays[
      Math.floor(Math.random() * possibleAnimationDelays.length)
    ];
  }, []);

  return (
    <figure
      className={clsx(
        "p-6 bg-white shadow-md opacity-0 animate-fade-in rounded-3xl shadow-gray-900/5",
        className
      )}
      style={{ animationDelay }}
      {...props}
    >
      <blockquote className="text-gray-900">
        <StarRating rating={rating} />
        <p className="mt-4 text-lg font-semibold leading-6 before:content-['“'] after:content-['”']">
          {title}
        </p>
        <p className="mt-3 text-base leading-7">{body}</p>
      </blockquote>
      <figcaption className="mt-3 text-sm text-gray-600 before:content-['–_']">
        {author}
      </figcaption>
    </figure>
  );
}

function splitArray(array: any[], numParts: number) {
  let result = [];
  for (let i = 0; i < array.length; i++) {
    let index = i % numParts;
    if (!result[index]) {
      result[index] = [];
    }
    // @ts-ignore
    result[index].push(array[i]);
  }
  return result;
}

function ReviewColumn({
  className,
  reviews,
  reviewClassName = () => {},
  msPerPixel = 0,
}: {
  className?: string;
  reviews: any[];
  reviewClassName: any;
  msPerPixel: number;
}) {
  let columnRef = useRef<HTMLDivElement | null>(null);
  let [columnHeight, setColumnHeight] = useState(0);
  let duration = `${columnHeight * msPerPixel}ms`;

  useEffect(() => {
    let resizeObserver = new window.ResizeObserver(() => {
      setColumnHeight(columnRef.current?.offsetHeight || 0);
    });

    if (!columnRef.current) return;

    resizeObserver.observe(columnRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={columnRef}
      className={clsx("py-4 space-y-8 animate-marquee", className)}
      // @ts-ignore
      style={{ "--marquee-duration": duration }}
    >
      {reviews.concat(reviews).map((review, reviewIndex) => (
        <Review
          key={reviewIndex}
          aria-hidden={reviewIndex >= reviews.length}
          className={reviewClassName(reviewIndex % reviews.length)}
          {...review}
        />
      ))}
    </div>
  );
}

function ReviewGrid() {
  let containerRef = useRef<HTMLDivElement | null>(null);
  let isInView = useInView(containerRef, { once: true, amount: 0.4 });
  let columns = splitArray(reviews, 3);
  // @ts-ignore
  columns = [columns[0], columns[1], splitArray(columns[2], 2)];

  return (
    <div
      ref={containerRef}
      className="relative -mx-4 mt-16 grid h-[49rem] max-h-[150vh] grid-cols-1 items-start gap-8 overflow-hidden px-4 sm:mt-20 md:grid-cols-2 lg:grid-cols-3"
    >
      {isInView && (
        <>
          <ReviewColumn
            reviews={[...columns[0], ...columns[2].flat(), ...columns[1]]}
            reviewClassName={(reviewIndex: number) =>
              clsx(
                // @ts-ignore
                reviewIndex >= columns[0].length + columns[2][0].length &&
                  "md:hidden",
                reviewIndex >= columns[0].length && "lg:hidden"
              )
            }
            msPerPixel={10}
          />
          <ReviewColumn
            reviews={[...columns[1], ...columns[2][1]]}
            className="hidden md:block"
            reviewClassName={(reviewIndex: number) =>
              reviewIndex >= columns[1].length && "lg:hidden"
            }
            msPerPixel={15}
          />
          {/* @ts-ignore */}
          <ReviewColumn
            reviews={columns[2].flat()}
            className="hidden lg:block"
            msPerPixel={10}
          />
        </>
      )}
      <div className="absolute inset-x-0 top-0 h-32 pointer-events-none bg-gradient-to-b from-gray-50" />
      <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-gray-50" />
    </div>
  );
}

export function Reviews() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="pt-20 pb-16 sm:pt-32 sm:pb-24"
    >
      <Container>
        <h2
          id="reviews-title"
          className="text-3xl font-medium tracking-tight text-gray-900 sm:text-center"
        >
          Everyone is changing their life with Altcoin.
        </h2>
        <p className="mt-2 text-lg text-gray-600 sm:text-center">
          Thousands of people have doubled their net-worth in the last 30 days.
        </p>
        <ReviewGrid />
      </Container>
    </section>
  );
}
