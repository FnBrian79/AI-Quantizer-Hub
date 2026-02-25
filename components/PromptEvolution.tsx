
import React, { useState } from 'react';
import { PromptContract } from '../types';
import { RefreshCcw, ArrowRight, Code, ListFilter, Github, Link as LinkIcon, FileSpreadsheet, Plus, Trash2, Pencil, Check, X } from 'lucide-react';

interface Props {
  contract: PromptContract;
  onUpdate?: (updates: Partial<PromptContract>) => void;
  onEvolve?: () => void;
  isEvolving?: boolean;
}

const PromptEvolution: React.FC<Props> = ({ contract, onUpdate, onEvolve, isEvolving }) => {
  const [repoInput, setRepoInput] = useState('');
  const [sheetInput, setSheetInput] = useState('');
  const [isConnectingRepo, setIsConnectingRepo] = useState(false);
  const [isConnectingSheet, setIsConnectingSheet] = useState(false);

  // Base prompt editing
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptDraft, setPromptDraft] = useState(contract.basePrompt);

  // Constraint editing
  const [editingConstraintIdx, setEditingConstraintIdx] = useState<number | null>(null);
  const [constraintDraft, setConstraintDraft] = useState('');
  const [newConstraint, setNewConstraint] = useState('');
  const [addingConstraint, setAddingConstraint] = useState(false);

  const handleConnectRepo = () => {
    if (!repoInput || !onUpdate) return;
    setIsConnectingRepo(true);
    setTimeout(() => {
      onUpdate({ githubRepo: repoInput });
      setIsConnectingRepo(false);
      setRepoInput('');
    }, 1200);
  };

  const handleConnectSheet = () => {
    if (!sheetInput || !onUpdate) return;
    setIsConnectingSheet(true);
    setTimeout(() => {
      onUpdate({ googleSheetUrl: sheetInput });
      setIsConnectingSheet(false);
      setSheetInput('');
    }, 1200);
  };

  const savePrompt = () => {
    onUpdate?.({ basePrompt: promptDraft });
    setEditingPrompt(false);
  };

  const cancelPrompt = () => {
    setPromptDraft(contract.basePrompt);
    setEditingPrompt(false);
  };

  const startEditConstraint = (idx: number) => {
    setEditingConstraintIdx(idx);
    setConstraintDraft(contract.constraints[idx]);
  };

  const saveConstraint = (idx: number) => {
    if (!constraintDraft.trim()) return;
    const updated = [...contract.constraints];
    updated[idx] = constraintDraft.trim();
    onUpdate?.({ constraints: updated });
    setEditingConstraintIdx(null);
  };

  const deleteConstraint = (idx: number) => {
    const updated = contract.constraints.filter((_, i) => i !== idx);
    onUpdate?.({ constraints: updated });
  };

  const addConstraint = () => {
    if (!newConstraint.trim()) return;
    onUpdate?.({ constraints: [...contract.constraints, newConstraint.trim()] });
    setNewConstraint('');
    setAddingConstraint(false);
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <RefreshCcw size={20} className="text-emerald-400" />
          PROMPT CONTRACT <span className="text-slate-500 font-normal">V{contract.version}</span>
        </h2>
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
          <span className="text-slate-500">M2M SCORE:</span>
          <span className="font-bold">{contract.evolutionScore}/10</span>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-auto">

        {/* Maestro Orchestration Sources */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Github size={12} className={contract.githubRepo ? "text-white" : "text-slate-600"} />
              GitHub Maestro
            </label>
            {contract.githubRepo ? (
              <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white rounded-full text-black">
                    <Github size={12} fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 truncate max-w-[120px]">{contract.githubRepo}</span>
                </div>
                <button onClick={() => onUpdate?.({ githubRepo: undefined })} className="text-[9px] text-slate-500 hover:text-red-400 uppercase font-bold underline">Unlink</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="github_user/repo"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-blue-500/50"
                />
                <button onClick={handleConnectRepo} disabled={isConnectingRepo} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold transition-colors"><LinkIcon size={12} /></button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <FileSpreadsheet size={12} className={contract.googleSheetUrl ? "text-emerald-400" : "text-slate-600"} />
              Apps Script Maestro
            </label>
            {contract.googleSheetUrl ? (
              <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-emerald-600 rounded-full text-white">
                    <FileSpreadsheet size={12} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-emerald-100 truncate max-w-[120px]">Live Sheet Active</span>
                    <span className="text-[7px] text-emerald-500 font-mono">POLLING_WEB_APP</span>
                  </div>
                </div>
                <button onClick={() => onUpdate?.({ googleSheetUrl: undefined })} className="text-[9px] text-slate-500 hover:text-red-400 uppercase font-bold underline">Unlink</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  placeholder="Apps Script Web App URL"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50"
                />
                <button onClick={handleConnectSheet} disabled={isConnectingSheet} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold transition-colors"><LinkIcon size={12} /></button>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-800/50 my-2"></div>

        {/* Editable Base Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Code size={12} /> Active Base Pattern
            </label>
            {!editingPrompt && (
              <button onClick={() => { setPromptDraft(contract.basePrompt); setEditingPrompt(true); }} className="text-[9px] text-slate-600 hover:text-blue-400 flex items-center gap-1 transition-colors">
                <Pencil size={10} /> Edit
              </button>
            )}
          </div>
          {editingPrompt ? (
            <div className="space-y-2">
              <textarea
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-blue-500/50 rounded-lg p-3 text-xs font-mono text-blue-300 resize-none focus:outline-none focus:border-blue-400"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={cancelPrompt} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-400 flex items-center gap-1 transition-colors"><X size={10} /> Cancel</button>
                <button onClick={savePrompt} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[10px] text-white flex items-center gap-1 transition-colors"><Check size={10} /> Save</button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono leading-relaxed text-blue-300 cursor-pointer hover:border-slate-700 transition-colors" onClick={() => { setPromptDraft(contract.basePrompt); setEditingPrompt(true); }}>
              {contract.basePrompt}
            </div>
          )}
        </div>

        {/* Editable Constraints */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ListFilter size={12} /> Quantized Constraints
            </label>
            <button onClick={() => setAddingConstraint(true)} className="text-[9px] text-slate-600 hover:text-emerald-400 flex items-center gap-1 transition-colors">
              <Plus size={10} /> Add
            </button>
          </div>
          <div className="grid gap-2">
            {contract.constraints.map((c, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-800 rounded-md group">
                {editingConstraintIdx === i ? (
                  <>
                    <input
                      autoFocus
                      value={constraintDraft}
                      onChange={(e) => setConstraintDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveConstraint(i); if (e.key === 'Escape') setEditingConstraintIdx(null); }}
                      className="flex-1 bg-transparent border-none outline-none text-[11px] text-slate-200 font-mono"
                    />
                    <button onClick={() => saveConstraint(i)} className="text-emerald-400 hover:text-emerald-300"><Check size={11} /></button>
                    <button onClick={() => setEditingConstraintIdx(null)} className="text-slate-600 hover:text-slate-400"><X size={11} /></button>
                  </>
                ) : (
                  <>
                    <ArrowRight size={10} className="text-slate-600 shrink-0" />
                    <span className="flex-1 text-[11px]">{c}</span>
                    <button onClick={() => startEditConstraint(i)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-blue-400 transition-all"><Pencil size={10} /></button>
                    <button onClick={() => deleteConstraint(i)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"><Trash2 size={10} /></button>
                  </>
                )}
              </div>
            ))}
            {addingConstraint && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-950/20 border border-emerald-800/40 rounded-md">
                <Plus size={10} className="text-emerald-500 shrink-0" />
                <input
                  autoFocus
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addConstraint(); if (e.key === 'Escape') { setAddingConstraint(false); setNewConstraint(''); } }}
                  placeholder="New constraint..."
                  className="flex-1 bg-transparent border-none outline-none text-[11px] text-emerald-300 font-mono placeholder:text-emerald-900"
                />
                <button onClick={addConstraint} className="text-emerald-400 hover:text-emerald-300"><Check size={11} /></button>
                <button onClick={() => { setAddingConstraint(false); setNewConstraint(''); }} className="text-slate-600 hover:text-slate-400"><X size={11} /></button>
              </div>
            )}
          </div>
        </div>

        {/* Self-Improvement Loop */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Self-Improvement Loop</label>
          <div className="h-16 relative bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-around px-8 opacity-30">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-8 bg-emerald-500/20 rounded-full"></div>
              ))}
            </div>
            <div className="relative z-10 flex items-center gap-4 text-[10px] font-mono">
              <span className="text-slate-500">RAW DATA</span>
              <ArrowRight size={14} className="text-emerald-500" />
              <span className="text-emerald-400 font-bold uppercase">Synthesizer</span>
              <ArrowRight size={14} className="text-emerald-500" />
              <span className="text-slate-500">CONTRACT V{contract.version + 1}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onEvolve}
        disabled={isEvolving}
        className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:text-emerald-600 rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20 transition-colors"
      >
        {isEvolving ? 'EVOLVING...' : 'EVOLVE MANUALLY'}
      </button>
    </section>
  );
};

export default PromptEvolution;
