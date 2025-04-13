"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Badge, IconButton, Tooltip, Menu, MenuItem } from "@mui/material";
import { Notifications as NotificationsIcon, AccountCircle, Mail as MailIcon } from "@mui/icons-material";

const Navbar = () => {
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [anchorElMessages, setAnchorElMessages] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nouveau projet assigné", description: "Vous avez été assigné au projet X.", date: "2025-02-13" },
    { id: 2, title: "Mise à jour de statut", description: "Le projet Y a été validé.", date: "2025-02-12" },
    { id: 3, title: "Date limite approchante", description: "La date limite de soumission pour le rapport est le 20 février.", date: "2025-02-10" },
  ]);
  const [messages, setMessages] = useState([
    { id: 1, from: "Prof. Ahmed", text: "Merci pour votre rapport." },
    { id: 2, from: "Administration", text: "Votre compte a été mis à jour." },
  ]);

  useEffect(() => {
    setNotifCount(notifications.length);
    setMsgCount(messages.length);
  }, [notifications, messages]);

  return (
    <header className="flex justify-between items-center p-4 lg:p-6 bg-[#FFFFFF] text-[#333333] shadow-lg w-full">

      <Link href="/" className="text-2xl font-bold hover:text-gray-500 transition">
      </Link>

      <div className="flex items-center gap-4 lg:gap-6">
        <Tooltip title="Notifications">
          <IconButton onClick={(e) => setAnchorElNotif(e.currentTarget)}>
            <Badge badgeContent={notifCount} color="error">
              <NotificationsIcon className="text-[#333333] text-lg lg:text-xl hover:text-gray-500 transition" />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu anchorEl={anchorElNotif} open={Boolean(anchorElNotif)} onClose={() => setAnchorElNotif(null)}>
          {notifications.length === 0 ? (
            <MenuItem>Aucune notification</MenuItem>
          ) : (
            notifications.map((notif) => (
              <MenuItem key={notif.id} onClick={() => setAnchorElNotif(null)}>
                <strong>{notif.title}</strong> <br />
                {notif.description} <br />
                <small>{notif.date}</small>
              </MenuItem>
            ))
          )}
        </Menu>

        <Tooltip title="Messages">
          <IconButton onClick={(e) => setAnchorElMessages(e.currentTarget)}>
            <Badge badgeContent={msgCount} color="primary">
              <MailIcon className="text-[#333333] text-lg lg:text-xl hover:text-gray-500 transition" />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu anchorEl={anchorElMessages} open={Boolean(anchorElMessages)} onClose={() => setAnchorElMessages(null)}>
          {messages.length === 0 ? (
            <MenuItem>Aucun message</MenuItem>
          ) : (
            messages.map((msg) => (
              <MenuItem key={msg.id} onClick={() => setAnchorElMessages(null)}>
                <strong>{msg.from}:</strong> {msg.text}
              </MenuItem>
            ))
          )}
        </Menu>

        <Tooltip title="Compte">
          <IconButton onClick={(e) => setAnchorElProfile(e.currentTarget)}>
            <AccountCircle className="text-[#333333] text-xl lg:text-2xl hover:text-gray-500 transition" />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={anchorElProfile} open={Boolean(anchorElProfile)} onClose={() => setAnchorElProfile(null)}>
          <MenuItem onClick={() => setAnchorElProfile(null)}>Mon Profil</MenuItem>
          <MenuItem onClick={() => setAnchorElProfile(null)}>Paramètres</MenuItem>
          <MenuItem onClick={() => setAnchorElProfile(null)}>Déconnexion</MenuItem>
        </Menu>
      </div>
    </header>
  );
};

export default Navbar;