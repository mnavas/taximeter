import Placeholder from "@/components/dashboard/Placeholder";

export default function FaresPage() {
  return (
    <Placeholder title="Fares" version="v0.1">
      <p className="tm-muted" style={{ margin: 0 }}>
        Define service tiers (Economy, Shared, SUV, Luxury), set the amount for each parameter, and
        attach time-of-day rules. Example tiers are seeded on install.
      </p>
    </Placeholder>
  );
}
