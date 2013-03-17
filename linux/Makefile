#
# 3zb2 (Zigock server-side bot) makefile 
#

SRCDIR=../src
VPATH=$(SRCDIR)

ARCH=i386
CC=gcc
BASE_CFLAGS=-m32 -Dstricmp=strcasecmp -DLINUX -DGAME_DLL

# -Wall
CFLAGS=$(BASE_CFLAGS) -O2 -g -DNDEBUG -fno-strict-aliasing -ffloat-store -pipe

LDFLAGS=-ldl -lm
SHLIBEXT=so
SHLIBCFLAGS=-fPIC
SHLIBLDFLAGS=-shared

#############################################################################

GAME_SRC := \
bot.c \
bot_fire.c \
bot_func.c \
bot_za.c \
g_chase.c \
g_cmds.c \
g_combat.c \
g_ctf.c \
g_func.c \
g_items.c \
g_main.c \
g_misc.c \
g_monster.c \
g_phys.c \
g_save.c \
g_spawn.c \
g_svcmds.c \
g_target.c \
g_trigger.c \
g_turret.c \
g_utils.c \
g_weapon.c \
m_move.c \
p_client.c \
p_hud.c \
p_menu.c \
p_trail.c \
p_view.c \
p_weapon.c \
q_shared.c

GAME_OBJ:=$(GAME_SRC:.c=.o)

.PHONY: default

default: game$(ARCH).$(SHLIBEXT)

TARGETS:=game$(ARCH).$(SHLIBEXT)

game$(ARCH).$(SHLIBEXT) : $(GAME_OBJ)
	$(CC) $(CFLAGS) $(SHLIBCFLAGS) $(SHLIBLDFLAGS) -o $@ $^ $(LDFLAGS)


#############################################################################
# MISC
#############################################################################

clean:
	-rm -f $(GAME_OBJ)

depend:
	gcc -MM $(GAME_OBJ:.o=.c)


install:
	cp gamei386.so ../quake2/3zb2/gamei386.real.so

#
# From "make depend"
#


