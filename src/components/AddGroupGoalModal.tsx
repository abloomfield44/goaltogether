"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { X, Sparkles } from "lucide-react";

interface AddGroupGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, targetValue: number, type: "count" | "percentage" | "binary", frequency: string) => void;
}

export function AddGroupGoalModal({ isOpen, onClose, onAdd }: AddGroupGoalModalProps) {
  const [actionType, setActionType] = useState("walk");
  const [customAction, setCustomAction] = useState("");
  const [targetValue, setTargetValue] = useState(3);
  const [unitType, setUnitType] = useState("miles");
  const [customUnit, setCustomUnit] = useState("");
  const [interval, setInterval] = useState("weekly");

  const getActionName = () => {
    return actionType === "custom" ? customAction : actionType;
  };

  const getUnitName = () => {
    return unitType === "custom" ? customUnit : unitType;
  };

  const getPreviewText = () => {
    const action = getActionName().trim();
    const unit = getUnitName().trim();
    const capitalizedAction = action ? action.charAt(0).toUpperCase() + action.slice(1) : "...";
    const intervalText = interval === "daily" ? "per day" : interval === "weekly" ? "per week" : "per month";
    
    return `${capitalizedAction} ${targetValue} ${unit || "..."} ${intervalText}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const action = getActionName().trim();
    const unit = getUnitName().trim();
    if (!action || !unit) return;

    const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
    const title = `${capitalizedAction} ${targetValue} ${unit}`;
    const type = unitType === "percent" ? "percentage" : "count";

    onAdd(title, targetValue, type, interval);
    
    // Reset form states
    setActionType("walk");
    setCustomAction("");
    setTargetValue(3);
    setUnitType("miles");
    setCustomUnit("");
    setInterval("weekly");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md z-10"
          >
            <Card className="border-2 border-teal-100 shadow-xl overflow-hidden bg-white">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-indigo-500"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xl font-bold text-slate-800">Add Group Goal</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Action Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">1. Action</label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="walk">Walk</option>
                      <option value="run">Run</option>
                      <option value="go">Go</option>
                      <option value="exercise">Exercise</option>
                      <option value="meditate">Meditate</option>
                      <option value="read">Read</option>
                      <option value="custom">Write your own...</option>
                    </select>

                    {actionType === "custom" && (
                      <input
                        type="text"
                        required
                        value={customAction}
                        onChange={(e) => setCustomAction(e.target.value)}
                        placeholder="e.g. Code, Study, Practice piano"
                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                    )}
                  </div>

                  {/* Target Value Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">2. Target Amount</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={targetValue}
                      onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>

                  {/* Unit Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">3. Unit</label>
                    <select
                      value={unitType}
                      onChange={(e) => setUnitType(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="miles">miles</option>
                      <option value="minutes">minutes</option>
                      <option value="pages">pages</option>
                      <option value="percent">percent</option>
                      <option value="custom">Write your own...</option>
                    </select>

                    {unitType === "custom" && (
                      <input
                        type="text"
                        required
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        placeholder="e.g. hours, pushups, books"
                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                    )}
                  </div>

                  {/* Interval/Frequency Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">4. Frequency</label>
                    <select
                      value={interval}
                      onChange={(e) => setInterval(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="daily">daily (per day)</option>
                      <option value="weekly">weekly (per week)</option>
                      <option value="monthly">monthly (per month)</option>
                    </select>
                  </div>

                  {/* Live Goal Preview */}
                  <div className="bg-gradient-to-br from-teal-50 to-indigo-50/50 p-4 rounded-2xl border border-teal-100/50 mt-6">
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      Goal Preview
                    </div>
                    <p className="text-slate-800 font-bold text-lg leading-snug">
                      {getPreviewText()}
                    </p>
                  </div>

                  {/* Submit buttons */}
                  <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-6">
                      Create Goal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
