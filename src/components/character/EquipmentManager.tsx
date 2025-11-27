"use client";

import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  Sword,
  Shield,
  X,
  ChevronDown,
  ChevronRight,
  Coins,
  Weight,
  Sparkles,
  Check,
  Info,
} from "lucide-react";
import {
  searchItems,
  getItemsByCategory,
  formatItem,
  getItemCategories,
  getItem,
  type Item,
} from "@/lib/items";

interface EquipmentItem {
  item_key?: string;
  name?: string;
  quantity: number;
  equipped?: boolean;
  attuned?: boolean;
}

interface EquipmentManagerProps {
  equipment: EquipmentItem[];
  onChange: (equipment: EquipmentItem[]) => void;
  readonly?: boolean;
}

export function EquipmentManager({
  equipment,
  onChange,
  readonly = false,
}: EquipmentManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const categories = getItemCategories();

  // Search results
  const searchResults = useMemo(() => {
    if (searchQuery.length >= 2) {
      return searchItems(searchQuery, 30);
    }
    if (selectedCategory !== "all") {
      return getItemsByCategory(selectedCategory).slice(0, 50);
    }
    return [];
  }, [searchQuery, selectedCategory]);

  // Get display name for an equipment item
  const getDisplayName = useCallback((item: EquipmentItem): string => {
    if (item.name) return item.name;
    if (item.item_key) {
      return item.item_key
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return "Unknown Item";
  }, []);

  // Get full item data if available
  const getItemData = useCallback((item: EquipmentItem): Item | undefined => {
    const name = item.name || getDisplayName(item);
    return getItem(name);
  }, [getDisplayName]);

  // Add item to equipment
  const addItem = useCallback(
    (item: Item) => {
      const existingIndex = equipment.findIndex(
        (e) => (e.name || getDisplayName(e)).toLowerCase() === item.name.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Increase quantity
        const newEquipment = [...equipment];
        newEquipment[existingIndex] = {
          ...newEquipment[existingIndex],
          quantity: newEquipment[existingIndex].quantity + 1,
        };
        onChange(newEquipment);
      } else {
        // Add new item
        onChange([...equipment, { name: item.name, quantity: 1 }]);
      }
      
      setSearchQuery("");
      setShowSearch(false);
    },
    [equipment, onChange, getDisplayName]
  );

  // Update quantity
  const updateQuantity = useCallback(
    (index: number, delta: number) => {
      const newEquipment = [...equipment];
      const newQuantity = newEquipment[index].quantity + delta;

      if (newQuantity <= 0) {
        newEquipment.splice(index, 1);
      } else {
        newEquipment[index] = { ...newEquipment[index], quantity: newQuantity };
      }

      onChange(newEquipment);
    },
    [equipment, onChange]
  );

  // Remove item
  const removeItem = useCallback(
    (index: number) => {
      const newEquipment = [...equipment];
      newEquipment.splice(index, 1);
      onChange(newEquipment);
    },
    [equipment, onChange]
  );

  // Toggle equipped status
  const toggleEquipped = useCallback(
    (index: number) => {
      const newEquipment = [...equipment];
      newEquipment[index] = {
        ...newEquipment[index],
        equipped: !newEquipment[index].equipped,
      };
      onChange(newEquipment);
    },
    [equipment, onChange]
  );

  // Calculate total weight
  const totalWeight = useMemo(() => {
    let weight = 0;
    for (const eq of equipment) {
      const itemData = getItemData(eq);
      if (itemData?.weight) {
        weight += itemData.weight * eq.quantity;
      }
    }
    return weight;
  }, [equipment, getItemData]);

  // Categorize equipment for display
  const categorizedEquipment = useMemo(() => {
    const weapons: (EquipmentItem & { data?: Item })[] = [];
    const armor: (EquipmentItem & { data?: Item })[] = [];
    const gear: (EquipmentItem & { data?: Item })[] = [];
    const magic: (EquipmentItem & { data?: Item })[] = [];

    for (const eq of equipment) {
      const data = getItemData(eq);
      const itemWithData = { ...eq, data };
      const name = getDisplayName(eq).toLowerCase();

      if (data?.rarity && data.rarity !== "none") {
        magic.push(itemWithData);
      } else if (
        data?.weapon ||
        name.includes("sword") ||
        name.includes("axe") ||
        name.includes("bow") ||
        name.includes("dagger")
      ) {
        weapons.push(itemWithData);
      } else if (
        data?.armor ||
        name.includes("armor") ||
        name.includes("mail") ||
        name.includes("shield")
      ) {
        armor.push(itemWithData);
      } else {
        gear.push(itemWithData);
      }
    }

    return { weapons, armor, gear, magic };
  }, [equipment, getItemData, getDisplayName]);

  return (
    <div className="space-y-4">
      {/* Header with weight and add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Weight className="w-4 h-4" />
            {totalWeight.toFixed(1)} lb.
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            {equipment.length} items
          </span>
        </div>

        {!readonly && (
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              showSearch
                ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                : "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
            )}
          >
            {showSearch ? (
              <>
                <X className="w-4 h-4" /> Close
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Item
              </>
            )}
          </button>
        )}
      </div>

      {/* Search Panel */}
      {showSearch && !readonly && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              autoFocus
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setSearchQuery("");
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  selectedCategory === cat.key
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {searchResults.map((item) => {
                const formatted = formatItem(item);
                return (
                  <button
                    key={`${item.name}-${item.source}`}
                    onClick={() => addItem(item)}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.weapon ? (
                          <Sword className="w-4 h-4 text-red-400" />
                        ) : item.armor ? (
                          <Shield className="w-4 h-4 text-blue-400" />
                        ) : formatted.rarity ? (
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-white">{item.name}</span>
                        {formatted.rarity && (
                          <span
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded",
                              formatted.rarity === "Common" && "bg-gray-600 text-gray-200",
                              formatted.rarity === "Uncommon" && "bg-green-600/30 text-green-400",
                              formatted.rarity === "Rare" && "bg-blue-600/30 text-blue-400",
                              formatted.rarity === "Very rare" && "bg-purple-600/30 text-purple-400",
                              formatted.rarity === "Legendary" && "bg-orange-600/30 text-orange-400"
                            )}
                          >
                            {formatted.rarity}
                          </span>
                        )}
                      </div>
                      <Plus className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{formatted.type}</span>
                      {formatted.damage && <span>{formatted.damage}</span>}
                      {formatted.ac && <span>{formatted.ac}</span>}
                      {formatted.value && (
                        <span className="flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {formatted.value}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-center text-gray-500 py-4">No items found</p>
          )}

          {searchQuery.length < 2 && selectedCategory === "all" && (
            <p className="text-center text-gray-500 py-4">
              Type to search or select a category
            </p>
          )}
        </div>
      )}

      {/* Equipment List */}
      <div className="space-y-4">
        {/* Weapons */}
        {categorizedEquipment.weapons.length > 0 && (
          <EquipmentSection
            title="Weapons"
            icon={<Sword className="w-4 h-4 text-red-400" />}
            items={categorizedEquipment.weapons}
            getDisplayName={getDisplayName}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            toggleEquipped={toggleEquipped}
            readonly={readonly}
            equipment={equipment}
          />
        )}

        {/* Armor */}
        {categorizedEquipment.armor.length > 0 && (
          <EquipmentSection
            title="Armor & Shields"
            icon={<Shield className="w-4 h-4 text-blue-400" />}
            items={categorizedEquipment.armor}
            getDisplayName={getDisplayName}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            toggleEquipped={toggleEquipped}
            readonly={readonly}
            equipment={equipment}
          />
        )}

        {/* Magic Items */}
        {categorizedEquipment.magic.length > 0 && (
          <EquipmentSection
            title="Magic Items"
            icon={<Sparkles className="w-4 h-4 text-purple-400" />}
            items={categorizedEquipment.magic}
            getDisplayName={getDisplayName}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            toggleEquipped={toggleEquipped}
            readonly={readonly}
            equipment={equipment}
          />
        )}

        {/* Gear */}
        {categorizedEquipment.gear.length > 0 && (
          <EquipmentSection
            title="Adventuring Gear"
            icon={<Package className="w-4 h-4 text-gray-400" />}
            items={categorizedEquipment.gear}
            getDisplayName={getDisplayName}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            toggleEquipped={toggleEquipped}
            readonly={readonly}
            equipment={equipment}
          />
        )}

        {/* Empty State */}
        {equipment.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No equipment</p>
            {!readonly && (
              <button
                onClick={() => setShowSearch(true)}
                className="mt-2 text-purple-400 hover:text-purple-300"
              >
                Add your first item
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Equipment section component
interface EquipmentSectionProps {
  title: string;
  icon: React.ReactNode;
  items: (EquipmentItem & { data?: Item })[];
  getDisplayName: (item: EquipmentItem) => string;
  updateQuantity: (index: number, delta: number) => void;
  removeItem: (index: number) => void;
  toggleEquipped: (index: number) => void;
  readonly: boolean;
  equipment: EquipmentItem[];
}

function EquipmentSection({
  title,
  icon,
  items,
  getDisplayName,
  updateQuantity,
  removeItem,
  toggleEquipped,
  readonly,
  equipment,
}: EquipmentSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white mb-2"
      >
        {icon}
        <span>{title}</span>
        <span className="text-gray-500">({items.length})</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            !expanded && "-rotate-90"
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-1 ml-6">
          {items.map((item, itemIdx) => {
            const index = equipment.findIndex((e) => e === item ||
              (e.name === item.name) ||
              (e.item_key === item.item_key && item.item_key));
            const formatted = item.data ? formatItem(item.data) : null;
            // Create unique key from item_key, name, or fallback to index
            const uniqueKey = item.item_key || item.name || `item-${itemIdx}`;
            const isExpanded = expandedItem === uniqueKey;

            return (
              <div key={uniqueKey} className="rounded-lg hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center justify-between p-2 group">
                  {/* Expand button for items with descriptions */}
                  {formatted?.description ? (
                    <button
                      onClick={() => setExpandedItem(isExpanded ? null : uniqueKey)}
                      className="p-1 text-gray-500 hover:text-gray-300 mr-1"
                    >
                      <ChevronRight className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-90")} />
                    </button>
                  ) : (
                    <div className="w-5" />
                  )}
                  
                  {/* Equipped Checkbox */}
                  {!readonly && (
                    <button
                      onClick={() => toggleEquipped(index)}
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center mr-3 shrink-0 transition-colors",
                        item.equipped
                          ? "bg-green-500 border-green-500"
                          : "border-gray-600 hover:border-gray-500"
                      )}
                      title={item.equipped ? "Equipped" : "Not equipped"}
                    >
                      {item.equipped && <Check className="w-3 h-3 text-white" />}
                    </button>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("truncate", item.equipped ? "text-white font-medium" : "text-gray-300")}>
                        {getDisplayName(item)}
                      </span>
                      {formatted?.rarity && (
                        <span
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded shrink-0",
                            formatted.rarity === "Common" && "bg-gray-600 text-gray-200",
                            formatted.rarity === "Uncommon" && "bg-green-600/30 text-green-400",
                            formatted.rarity === "Rare" && "bg-blue-600/30 text-blue-400",
                            formatted.rarity === "Very rare" && "bg-purple-600/30 text-purple-400",
                            formatted.rarity === "Legendary" && "bg-orange-600/30 text-orange-400"
                          )}
                        >
                          {formatted.rarity}
                        </span>
                      )}
                    </div>
                    {formatted && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        {formatted.type && <span>{formatted.type}</span>}
                        {formatted.damage && <span className="text-red-400">• {formatted.damage}</span>}
                        {formatted.ac && <span className="text-blue-400">• {formatted.ac}</span>}
                        {formatted.weight && <span>• {formatted.weight}</span>}
                        {formatted.value && <span className="text-amber-400">• {formatted.value}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!readonly && (
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                    
                    <span className="w-8 text-center text-gray-300">
                      ×{item.quantity}
                    </span>

                    {!readonly && (
                      <>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Expanded item details */}
                {isExpanded && formatted && (
                  <div className="px-3 pb-3 ml-6 text-sm space-y-2">
                    {formatted.properties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formatted.properties.map((prop, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">
                            {prop}
                          </span>
                        ))}
                      </div>
                    )}
                    {formatted.attunement && (
                      <div className="text-purple-400 text-xs italic">
                        {formatted.attunement}
                      </div>
                    )}
                    {formatted.description && (
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {formatted.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
