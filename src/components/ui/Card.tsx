import { type ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
}

export function Card({
  title,
  subtitle,
  icon,
  children,
  className = "",
  headerActions,
}: CardProps) {
  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-xl overflow-hidden ${className}`}>
      {(title || headerActions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3">
            {icon && <span className="text-blue-400">{icon}</span>}
            <div>
              {title && <h3 className="font-semibold text-white">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
            </div>
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

interface CardGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
}

export function CardGrid({ children, cols = 2 }: CardGridProps) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return <div className={`grid gap-4 ${colsClass[cols]}`}>{children}</div>;
}
