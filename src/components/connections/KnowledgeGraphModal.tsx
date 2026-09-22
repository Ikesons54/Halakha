import React, { useState } from 'react';
import { X, Network, BookOpen, ExternalLink, Sparkles, Compass } from 'lucide-react';
import { KnowledgeGraphData, KnowledgeNode } from '../../types';

interface KnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  graphData: KnowledgeGraphData;
  onOpenScriptureByRef?: (reference: string) => void;
}

export const KnowledgeGraphModal: React.FC<KnowledgeGraphModalProps> = ({
  isOpen,
  onClose,
  graphData,
  onOpenScriptureByRef,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(graphData.centralNode || 'node-passover');

  if (!isOpen) return null;

  const selectedNode = graphData.nodes.find((n) => n.id === selectedNodeId) || graphData.nodes[0];

  // Find all direct edges connected to the selected node
  const directEdges = graphData.edges.filter(
    (e) => e.from === selectedNodeId || e.to === selectedNodeId
  );

  // Find connected neighbor nodes
  const neighborNodeIds = directEdges.map((e) => (e.from === selectedNodeId ? e.to : e.from));
  const connectedNodes = graphData.nodes.filter((n) => neighborNodeIds.includes(n.id));

  const getNodeColor = (type: KnowledgeNode['type']) => {
    switch (type) {
      case 'feast':
        return 'border-[#B39452] bg-[#B39452]/10 text-[#8D7135] dark:text-[#E8DDC8]';
      case 'messianic':
        return 'border-[#263A32] bg-[#263A32]/10 text-[#263A32] dark:text-[#B39452] font-semibold';
      case 'scripture':
        return 'border-sky-600/40 bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300';
      case 'concept':
        return 'border-amber-600/40 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300';
      case 'event':
        return 'border-emerald-600/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300';
      default:
        return 'border-stone-400 bg-stone-100 text-stone-800';
    }
  };

  return (
    <div
      id="knowledge-graph-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="knowledge-graph-modal"
        className="w-full max-w-4xl max-h-[90vh] bg-[#F8F6F0] dark:bg-[#19211D] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8DDC8] dark:border-[#2E3B33] flex items-center justify-between bg-white dark:bg-[#1C2420]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#263A32] text-[#B39452] flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#202421] dark:text-[#F3F0E8] tracking-tight">
                  Scripture Knowledge Graph
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#B39452]/20 text-[#B39452]">
                  Connection Engine
                </span>
              </div>
              <p className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
                Explore how biblical themes, Hebrew concepts, and Messianic prophecies interlock.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/50 dark:hover:bg-[#222C27] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Interactive Node Visualizer & Detail Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Network Diagram Representation (lg: 7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-xs">
            {/* Visual Header */}
            <div className="flex items-center justify-between text-xs text-[#69716B] dark:text-[#AEB6AF] pb-3 border-b border-[#E8DDC8]/60 dark:border-[#2E3B33]">
              <span className="flex items-center gap-1 font-semibold text-[#263A32] dark:text-[#E8DDC8]">
                <Compass className="w-3.5 h-3.5 text-[#B39452]" /> Tap any node to pivot graph
              </span>
              <span className="text-[11px] font-mono">
                {connectedNodes.length} direct connection{connectedNodes.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Central Node Visual Box */}
            <div className="my-6 flex flex-col items-center">
              <div className="w-full text-center space-y-1 mb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B39452]">
                  Current Focal Point
                </span>
              </div>

              {/* Central Focused Node */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border-2 shadow-sm text-center max-w-xs w-full transition-all duration-300 ring-4 ring-[#B39452]/20 ${getNodeColor(
                  selectedNode.type
                )}`}
              >
                {selectedNode.hebrew && (
                  <span className="block font-scripture text-2xl sm:text-3xl text-[#263A32] dark:text-[#E8DDC8] mb-0.5 tracking-wide">
                    {selectedNode.hebrew}
                  </span>
                )}
                <h4 className="font-bold text-base sm:text-lg tracking-wide uppercase">
                  {selectedNode.label}
                </h4>
                {selectedNode.scriptureRef && (
                  <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">
                    {selectedNode.scriptureRef}
                  </span>
                )}
              </div>

              {/* Visual Branch Connectors */}
              <div className="h-6 w-0.5 bg-gradient-to-b from-[#B39452] to-[#263A32] my-1" />
              <span className="text-[10px] font-semibold text-[#69716B] dark:text-[#AEB6AF] uppercase tracking-wider">
                Direct Biblical Links
              </span>
            </div>

            {/* Connected Orbital Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {connectedNodes.map((node) => {
                const edge = directEdges.find(
                  (e) => (e.from === node.id && e.to === selectedNodeId) || (e.from === selectedNodeId && e.to === node.id)
                );
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3 rounded-xl border text-left transition-all hover:scale-102 hover:shadow-xs group flex flex-col justify-between ${getNodeColor(
                      node.type
                    )}`}
                  >
                    <div>
                      {node.hebrew && (
                        <span className="block font-scripture text-sm opacity-80 mb-0.5">
                          {node.hebrew}
                        </span>
                      )}
                      <span className="font-semibold text-xs block group-hover:text-[#263A32] dark:group-hover:text-white">
                        {node.label}
                      </span>
                    </div>

                    {edge && (
                      <span className="text-[10px] mt-2 pt-1 border-t border-black/10 dark:border-white/10 opacity-75 font-medium line-clamp-1">
                        ↳ {edge.relationship}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Node Detail & Scripture Insights Panel (lg: 5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-[#B39452] bg-[#B39452]/10 px-2 py-0.5 rounded">
                  {selectedNode.type}
                </span>
                {selectedNode.hebrew && (
                  <span className="font-scripture text-lg text-[#263A32] dark:text-[#E8DDC8]">
                    {selectedNode.hebrew}
                  </span>
                )}
              </div>

              <h4 className="font-scripture text-2xl font-bold text-[#202421] dark:text-[#F3F0E8]">
                {selectedNode.label}
              </h4>

              <p className="text-sm text-[#333C37] dark:text-[#CAD3CC] leading-relaxed">
                {selectedNode.description}
              </p>

              {selectedNode.scriptureRef && (
                <div className="p-3 bg-[#FAF8F5] dark:bg-[#151D19] border-l-2 border-[#B39452] rounded-r-lg">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#263A32] dark:text-[#E8DDC8]">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#B39452]" />
                      Anchor Scripture:
                    </span>
                    <span>{selectedNode.scriptureRef}</span>
                  </div>
                </div>
              )}

              {/* Connected Relationships List */}
              <div className="pt-2 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#69716B] dark:text-[#AEB6AF] block">
                  Theological Relationships:
                </span>
                <div className="space-y-1.5">
                  {directEdges.map((edge, idx) => {
                    const otherNodeId = edge.from === selectedNodeId ? edge.to : edge.from;
                    const otherNode = graphData.nodes.find((n) => n.id === otherNodeId);
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedNodeId(otherNodeId)}
                        className="text-xs flex items-center justify-between p-2 rounded-lg bg-[#F8F6F0] dark:bg-[#222C27] hover:bg-[#E8DDC8]/50 cursor-pointer transition-colors"
                      >
                        <span className="font-medium text-[#202421] dark:text-[#F3F0E8]">
                          {otherNode?.label}
                        </span>
                        <span className="text-[11px] text-[#B39452] font-semibold">
                          {edge.relationship} →
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 bg-[#FAF8F5] dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl flex items-center justify-between gap-2">
              <span className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
                Read anchor text in Bible
              </span>
              {selectedNode.scriptureRef && onOpenScriptureByRef && (
                <button
                  onClick={() => {
                    onOpenScriptureByRef(selectedNode.scriptureRef!);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#263A32] text-[#F8F6F0] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1F2F29] transition-colors"
                >
                  <span>Open Passage</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E8DDC8] dark:border-[#2E3B33] bg-white dark:bg-[#1C2420] flex items-center justify-between text-xs text-[#69716B] dark:text-[#AEB6AF]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#B39452]" />
            HALAKHA Scripture Graph • Non-speculative biblical connections
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#E8DDC8]/50 dark:bg-[#222C27] hover:bg-[#E8DDC8] text-[#263A32] dark:text-[#E8DDC8] font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
