"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Lock,
  Mail,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from "lucide-react";

export interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteComplete?: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onDeleteComplete,
}) => {
  const { user, profile, deleteAccount } = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Determine target email for verification
  const targetEmail = (user?.email || profile?.email || "").trim();
  const isTargetEmpty = !targetEmail;
  const isEmailMatch = isTargetEmpty
    ? emailInput.trim().toUpperCase() === "DELETE"
    : emailInput.trim().toLowerCase() === targetEmail.toLowerCase();

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setEmailInput("");
      setPasswordInput("");
      setRequiresPassword(false);
      setErrorMessage(null);
      setIsSuccess(false);
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailMatch || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteAccount(emailInput.trim(), passwordInput.trim() || undefined);
      setIsSuccess(true);
      if (onDeleteComplete) {
        onDeleteComplete();
      }
      setTimeout(() => {
        onClose();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }, 1500);
    } catch (err: any) {
      if (err?.code === "auth/requires-recent-login") {
        setRequiresPassword(true);
        setErrorMessage(
          "Firebase security requires your password to authorize permanent account deletion. Please enter your password below and click Confirm Deletion."
        );
      } else {
        setErrorMessage(err?.message || "Failed to delete account. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      title="Delete Account Completely"
      maxWidth="md"
    >
      <div className="space-y-4 text-slate-200">
        {isSuccess ? (
          <div className="p-6 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Account Permanently Deleted</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              All credentials and data have been completely erased from Firebase and Cloud Firestore. Your profile has been restarted with a clean default workspace. Redirecting...
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Restarting workspace...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            {/* Warning Alert Banner */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-rose-300">Permanent & Irreversible Deletion</p>
                <p className="text-rose-200/80 leading-relaxed">
                  This action will permanently purge your candidate account. The following will be completely erased:
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-rose-300/90 text-[11px] pt-1">
                  <li>Google Cloud Firestore profile, resumes, skills &amp; job applications</li>
                  <li>Firebase Authentication credentials (login will be completely deleted)</li>
                  <li>Device offline cache (profile will restart with clean default workspace)</li>
                </ul>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-900/40 border border-rose-700/60 text-rose-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Double Verification Email Input */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-300">
                Double Verification Required:
              </label>
              <p className="text-[11px] text-slate-400">
                To confirm that you are fully willing to permanently delete this account, please re-enter your account email address below:
              </p>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-[11px] text-slate-400">Target Email:</span>
                <span className="text-[11px] font-mono font-bold text-amber-300 select-all">
                  {targetEmail || "DELETE"}
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={
                    targetEmail ? `Type "${targetEmail}" to confirm...` : 'Type "DELETE" to confirm...'
                  }
                  autoFocus
                  disabled={isDeleting}
                  className={`w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border ${
                    isEmailMatch
                      ? "border-emerald-500/80 focus:border-emerald-400"
                      : emailInput.length > 0
                      ? "border-rose-500/80 focus:border-rose-400"
                      : "border-slate-700 focus:border-indigo-500"
                  } text-white focus:outline-none transition-colors`}
                />
                {isEmailMatch && (
                  <span className="absolute right-3 top-2.5 text-emerald-400 flex items-center gap-1 text-[11px] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Re-authentication Password Input (shown when Firebase demands recent login or re-auth) */}
            {requiresPassword && (
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-amber-600/40 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Security Re-Authentication (Password)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enter your account password to verify your identity with Firebase:
                </p>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter your account password..."
                  disabled={isDeleting}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isDeleting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                disabled={!isEmailMatch || isDeleting || (requiresPassword && !passwordInput.trim())}
                isLoading={isDeleting}
                className="text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                {isDeleting ? "Erasing Entire Account..." : "Permanently Delete Account"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
