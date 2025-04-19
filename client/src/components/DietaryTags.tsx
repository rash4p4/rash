import { Badge } from "@/components/ui/badge";

export interface DietaryTag {
  id: string;
  name: string;
  active: boolean;
}

interface DietaryTagsProps {
  tags: DietaryTag[];
  onClick?: (tag: DietaryTag) => void;
  editable?: boolean;
}

export default function DietaryTags({ 
  tags, 
  onClick,
  editable = false
}: DietaryTagsProps) {
  const handleClick = (tag: DietaryTag) => {
    if (editable && onClick) {
      onClick(tag);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant="outline"
          className={`px-3 py-1 rounded-full text-sm font-medium cursor-${editable ? 'pointer' : 'default'} ${
            tag.active
              ? "bg-secondary bg-opacity-10 text-secondary"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => handleClick(tag)}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
